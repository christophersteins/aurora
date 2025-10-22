interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-action-primary focus:ring-offset-2 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${
        checked ? 'bg-action-primary' : 'bg-[#3a3f42]'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
