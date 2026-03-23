<?php

namespace App\Services;

use App\Models\ChatbotMessage;
use App\Models\ChatbotSession;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatbotService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    /** @var string[] */
    private array $fallbackModels = [
        'openai/gpt-4o-mini',
        'google/gemini-2.0-flash-001',
        'deepseek/deepseek-chat:free',
    ];

    public function __construct()
    {
        $this->apiKey = (string) config('services.openrouter.key', '');
        $this->baseUrl = (string) config('services.openrouter.base_url', 'https://openrouter.ai/api/v1');
        $this->model = (string) config('services.openrouter.model', 'openai/gpt-4o-mini');
    }

    public function sendMessage(
        string $message,
        ?string $sessionToken,
        User $user,
        array $weatherData = [],
        array $forecastData = []
    ): array
    {
        // Resolve or create session
        $session = $this->resolveSession($user->id, $sessionToken);

        // Load last 10 messages from DB for this session
        $history = ChatbotMessage::where('session_id', $session->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn($m) => [
                'role'    => $m->role,
                'content' => $m->content,
            ])
            ->values()
            ->toArray();

        // Store user message
        ChatbotMessage::create([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $message,
        ]);

        $systemPrompt = $this->buildSystemPrompt($user, $weatherData, $forecastData);

        $messages = array_merge(
            [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
            ],
            $history,
            [
                [
                    'role' => 'user',
                    'content' => $message,
                ],
            ]
        );

        $models = array_values(array_unique(array_filter([
            $this->model,
            ...$this->fallbackModels,
        ])));

        $reply = null;
        $lastError = null;

        foreach ($models as $model) {
            $response = Http::timeout(25)
                ->retry(2, 300)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'HTTP-Referer' => (string) config('app.url'),
                    'X-Title' => 'Doon CALABARZON Travel Assistant',
                    'Content-Type' => 'application/json',
                ])
                ->post(rtrim($this->baseUrl, '/') . '/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'max_tokens' => 1024,
                ]);

            if ($response->ok()) {
                $reply = (string) ($response->json('choices.0.message.content') ?? '');
                if ($reply !== '') {
                    break;
                }
            }

            $lastError = sprintf('model=%s status=%s body=%s', $model, $response->status(), (string) $response->body());
        }

        if ($reply === null || $reply === '') {
            throw new \RuntimeException('Chatbot unavailable: ' . (string) $lastError);
        }

        // Store assistant message
        ChatbotMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => $reply,
        ]);

        return [
            'reply' => trim($reply),
            'session_token' => $session->session_token,
        ];
    }

    public function history(?int $userId, string $authSessionId, string $sessionToken): array
    {
        $session = ChatbotSession::query()
            ->where('session_token', $sessionToken)
            ->where('user_id', $userId)
            ->first();

        if (! $session) {
            return [];
        }

        return ChatbotMessage::query()
            ->where('session_id', $session->id)
            ->orderBy('created_at')
            ->take(20)
            ->get(['role', 'content', 'created_at'])
            ->map(fn (ChatbotMessage $message) => [
                'role' => $message->role,
                'content' => $message->content,
                'created_at' => $message->created_at,
            ])
            ->values()
            ->toArray();
    }

    private function resolveSession(int $userId, ?string $token): ChatbotSession
    {
        if ($token) {
            $existing = ChatbotSession::query()
                ->where('session_token', $token)
                ->where('user_id', $userId)
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        return ChatbotSession::create([
            'user_id' => $userId,
            'session_token' => Str::uuid()->toString(),
            'context' => null,
        ]);
    }

    private function buildSystemPrompt(
        User $user,
        array $weatherData = [],
        array $forecastData = []
    ): string
    {
        $profile = $user->touristProfile;

        $itinerariesText = 'None yet.';
        if ($user->itineraries->isNotEmpty()) {
            $itinerariesText = $user->itineraries->map(function ($itin): string {
                $stops = $itin->items->map(function ($item): string {
                    $dest = $item->destination;

                    if (! $dest) {
                        return "Day {$item->day_number}: Custom stop";
                    }

                    $provinceName = $dest->province?->name ?? '';
                    $estimatedCost = $item->estimated_cost ?? 0;

                    return "Day {$item->day_number}: {$dest->name} ({$provinceName}) - est. PHP{$estimatedCost}";
                })->join(', ');

                $dateRange = 'No dates set';
                if ($itin->start_date && $itin->end_date) {
                    $startDate = date('M d', strtotime((string) $itin->start_date));
                    $endDate = date('M d Y', strtotime((string) $itin->end_date));
                    $dateRange = "{$startDate} to {$endDate}";
                }

                return "- {$itin->title} ({$dateRange}, {$itin->status}): {$stops}";
            })->join("\n");
        }

        $savedText = 'None saved yet.';
        if ($user->favorites->isNotEmpty()) {
            $savedText = $user->favorites->map(function ($fav): ?string {
                $destination = $fav->destination;
                if (! $destination) {
                    return null;
                }

                $provinceName = $destination->province?->name ?? 'unknown';
                return "- {$destination->name} in {$provinceName} (rated {$destination->avg_rating} star)";
            })->filter()->join("\n");
        }

        $reviewsText = 'No reviews written yet.';
        if ($user->reviews->isNotEmpty()) {
            $reviewsText = $user->reviews->map(function ($rev): ?string {
                $destination = $rev->destination;
                if (! $destination) {
                    return null;
                }

                $title = $rev->title ?? '';
                return "- {$destination->name}: {$rev->rating} star - \"{$title}\"";
            })->filter()->join("\n");
        }

        $prefText = 'Not set.';
        if ($profile) {
            $prefText = implode(', ', array_filter([
                $profile->generational_profile ? "Generation: {$profile->generational_profile}" : null,
                $profile->preferred_budget ? "Budget preference: {$profile->preferred_budget}" : null,
                $profile->travel_style ? "Travel style: {$profile->travel_style}" : null,
            ]));

            if ($prefText === '') {
                $prefText = 'Not set.';
            }
        }

        $weatherText = collect($weatherData)->map(function (array $weather): string {
            $province = (string) ($weather['province'] ?? 'Unknown province');
            $condition = (string) ($weather['condition'] ?? 'Unavailable');
            $normalizedCondition = strtolower($condition);
            $temperature = $weather['temperature'];
            $humidity = $weather['humidity'];
            $windSpeed = $weather['wind_speed'];

            $advice = 'Good travel conditions';
            if (str_contains($normalizedCondition, 'rain')) {
                $advice = 'Rainy - recommend bringing raincoat';
            } elseif (is_numeric($temperature) && (float) $temperature >= 32) {
                $advice = 'Very hot - recommend sunscreen and hydration';
            } elseif (is_numeric($temperature) && (float) $temperature <= 22) {
                $advice = 'Cool - light jacket recommended';
            }

            $tempText = is_numeric($temperature) ? $temperature . '°C' : 'N/A';
            $humidityText = is_numeric($humidity) ? $humidity . '%' : 'N/A';
            $windText = is_numeric($windSpeed) ? $windSpeed . ' m/s' : 'N/A';

            return "- {$province}: {$tempText}, {$condition}, Humidity {$humidityText}, Wind {$windText}. Travel advice: {$advice}";
        })->join("\n");

        if ($weatherText === '') {
            $weatherText = '- Weather data is currently unavailable.';
        }

        $forecastText = '';
        foreach ($forecastData as $province => $days) {
            if (! is_array($days) || empty($days)) {
                continue;
            }

            $forecastText .= "\n{$province} forecast:\n";
            $futureDays = array_slice($days, 1, 4);

            foreach ($futureDays as $day) {
                $dateLabel = (string) ($day['date_label'] ?? 'Unknown day');
                $tempMin = $day['temp_min'] ?? 'N/A';
                $tempMax = $day['temp_max'] ?? 'N/A';
                $conditionLabel = (string) ($day['condition'] ?? 'Unknown');

                $forecastText .= "\n  {$dateLabel} ({$tempMin}°-{$tempMax}°C overall, {$conditionLabel}):\n";

                foreach (($day['hourly'] ?? []) as $hour) {
                    $rainText = ((int) ($hour['pop'] ?? 0)) > 0
                        ? ', ' . (int) $hour['pop'] . '% rain chance'
                        : '';

                    $timeLabel = (string) ($hour['time'] ?? 'N/A');
                    $tempLabel = $hour['temp'] ?? 'N/A';
                    $hourCondition = (string) ($hour['condition'] ?? 'Unknown');

                    $forecastText .= "    {$timeLabel}: {$tempLabel}°C, {$hourCondition}{$rainText}\n";
                }
            }
        }

        if ($forecastText === '') {
            $forecastText = "\nForecast data is currently unavailable for all provinces.\n";
        }

        return "You are Doon, a friendly AI travel assistant for the CALABARZON region of the Philippines, covering five provinces: Batangas, Laguna, Cavite, Rizal, and Quezon.

You are talking to {$user->name}.

=== LIVE WEATHER RIGHT NOW ===
The following is real-time weather data for all 5 CALABARZON provinces as of this moment. Use this data to answer any weather-related questions accurately. Do not say you cannot check weather - you have the current data below:

{$weatherText}

=== 4-DAY FORECAST (next 4 days) ===
The following is a real 5-day forecast from OpenWeatherMap. Use this data to answer any questions about upcoming weather accurately.
Do NOT say you cannot check future weather - you have the forecast data below:

{$forecastText}

When answering weather questions:
1. Always mention temperature, condition, humidity, and wind speed from the live data.
2. After giving the weather, always suggest 2 to 3 specific destinations from the user's province that suit current conditions:
    - Clear and sunny: suggest beach or outdoor spots
    - Cloudy or cool: suggest cultural or indoor spots
    - Rainy: suggest food spots or covered attractions
3. Only suggest destinations that exist in the CALABARZON database context you have in this prompt. Never invent destination names.
4. After destination suggestions, always end with exactly ONE follow-up question chosen by context:
    - Would you like me to add any of these to your itinerary?
    - Want me to show you what to pack for this weather?
    - Shall I find more destinations in {province} that match today's conditions?
5. Ask only one follow-up question at a time.
6. Keep weather responses concise: maximum 4 short paragraphs, no long lists.
7. If user says yes to adding itinerary items, respond exactly:
    You can add it from the Saved Places page or the Recommendations page. I cannot add items directly but I can guide you!

When answering forecast questions:
1. State the specific day by name, for example: Tomorrow, Monday March 23.
2. When stating the temperature range for a forecast day:
    - Always clarify that the lower number is the overnight or early morning low and the higher number is the afternoon peak.
    - Frame it naturally like this: Temperatures will range from a cool 21°C overnight to a warm 30°C in the afternoon.
    - Do not format it as only a numeric range like between 21°-30°C.
    - If temp_max is 28 or above, mention it will feel hot in the afternoon.
    - If temp_min is 22 or below, mention it will feel cool in the early morning or evening.
3. Describe condition clearly.
4. Give one practical travel tip for that day.
5. If weather is good, suggest one destination in that province suited for those conditions.
6. End with one action question only:
    - Would you like to plan a trip for that day?
    - Want me to suggest what to pack?

When a user asks about weather for a specific day and province, show the hourly breakdown in this exact format:

Tomorrow in Batangas (Monday, March 23):

🌙 12:00 AM - 22°C, clear sky
🌅 6:00 AM - 23°C, few clouds
🌤️ 9:00 AM - 27°C, clear sky
☀️ 12:00 PM - 30°C, clear sky
☀️ 3:00 PM - 31°C, clear sky
🌇 6:00 PM - 28°C, few clouds
🌙 9:00 PM - 25°C, clear sky

Overall: 22°-31°C. Hot afternoon, cool evening.
Best time to go out: Morning (before 10AM) or late afternoon (after 4PM).

Use these time-of-day emoji:
12AM-5AM   -> 🌙
6AM-7AM    -> 🌅
8AM-11AM   -> 🌤️
12PM-3PM   -> ☀️ (or ⛈️ if rain)
4PM-6PM    -> 🌇
7PM-11PM   -> 🌙

If there is rain chance above 50% at any hour, add a 🌧️ and the percentage. Example:
3:00 PM - 28°C, light rain 🌧️ 70%

After the hourly table always add:
1. A one-line summary of the best time to visit.
2. One packing tip based on the day's conditions.
3. One destination suggestion for that province that suits the weather.
4. The action question: Want me to help plan your trip for this day?

Only show the hourly breakdown when the user asks about a SPECIFIC day in a SPECIFIC province.
If they ask generally like what is the weather this week, show daily summary format without hourly details.
If they ask about a specific time like what time is best to visit Batangas tomorrow, highlight the best 2 to 3 hour windows based on temperature and rain chance.

Example response for: What is the weather in Batangas tomorrow?
Tomorrow in Batangas (Monday, March 23) it will be 26°-31°C with clear skies and low humidity - excellent conditions for an outdoor trip!

Great day to visit Masasa Beach or Taal Volcano. I recommend bringing sunscreen SPF 50+ and plenty of water.

Would you like me to help you plan a Batangas trip for tomorrow?

=== THEIR TRAVEL PROFILE ===
{$prefText}

=== THEIR SAVED PLACES ===
{$savedText}

=== THEIR ITINERARIES ===
{$itinerariesText}

=== THEIR REVIEWS ===
{$reviewsText}

=== YOUR ROLE ===
You can answer questions about:
1. CALABARZON destinations, activities, food, culture, and travel tips
2. Their personal saved places - reference them by name
3. Their itineraries - tell them what is planned, suggest additions or changes
4. Their reviews - reference what they have visited and what they thought
5. Packing suggestions based on their upcoming trips
6. Budget advice based on their preference profile
7. Personalized recommendations based on their travel style and past activities

=== RESPONSE RULES ===
- For questions about saved places, always state the saved count and list each saved place by name.
- For questions about itineraries, always mention itinerary title, date range, stops, and estimated costs when available.
- For questions about reviews, always mention destination names and ratings from their reviews.
- For packing questions about a specific place, explicitly say whether that place appears in their saved places or itineraries.
- For 'similar destination' requests, infer similarity from their saved places and suggest destinations in CALABARZON only.
- For trip cost questions, provide a clear sum using the itinerary item estimated costs.
- If personal data is missing, clearly say what is missing instead of guessing.
- For weather questions, use the live weather section above and compare provinces when asked for best weather.
- For forecast questions, compare forecast data across all five provinces if user asks for the best day or best province.

When they ask about their data always reference it specifically. For example:
- You have 3 saved places including Masasa Beach and Taal Volcano
- Your Batangas Beach Weekend itinerary has 3 stops starting March 28
- Based on your budget preference, here are some options under PHP500

Always respond in English only.
Be warm, concise, and practical.
If asked something unrelated to travel or their account data, politely redirect to travel planning.";
    }
}
