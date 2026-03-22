<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
        'is_active',
        'data_privacy_consent',
        'consent_given_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'data_privacy_consent' => 'boolean',
            'consent_given_at' => 'datetime',
        ];
    }

    public function touristProfile(): HasOne
    {
        return $this->hasOne(TouristProfile::class);
    }

    public function localProviderProfile(): HasOne
    {
        return $this->hasOne(LocalProviderProfile::class);
    }

    public function submittedDestinations(): HasMany
    {
        return $this->hasMany(Destination::class, 'submitted_by');
    }

    public function approvedDestinations(): HasMany
    {
        return $this->hasMany(Destination::class, 'approved_by');
    }

    public function itineraries(): HasMany
    {
        return $this->hasMany(Itinerary::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function chatbotSessions(): HasMany
    {
        return $this->hasMany(ChatbotSession::class);
    }

    public function analyticsEvents(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class);
    }

    public function adminActivityLogs(): HasMany
    {
        return $this->hasMany(AdminActivityLog::class, 'admin_id');
    }

    public function generatedReports(): HasMany
    {
        return $this->hasMany(LguMonthlyReport::class, 'generated_by');
    }
}
