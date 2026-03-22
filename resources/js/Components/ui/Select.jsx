export default function Select({ options = [], ...props }) {
    return (
        <select className="form-input form-select" {...props}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
}
