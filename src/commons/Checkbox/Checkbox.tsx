import { useState } from 'react';

interface IProps {
  className?: string;
  label: string;
  handleOnChange(label: string): void;
  isChecked?: boolean; // Add this prop
}

const Checkbox = ({ className, label, handleOnChange, isChecked: externalIsChecked }: IProps) => {
  // Use controlled component if externalIsChecked is provided, otherwise use internal state
  const [internalIsChecked, setInternalIsChecked] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const checked = externalIsChecked !== undefined ? externalIsChecked : internalIsChecked;

  const toggleCheckboxChange = () => {
    if (externalIsChecked === undefined) {
      // Only update internal state if we're not controlled externally
      setInternalIsChecked(!internalIsChecked);
    }
    handleOnChange(label);
  };

  return (
    <div className={className}>
      <label>
        <input
          type="checkbox"
          value={label}
          checked={checked}
          onChange={toggleCheckboxChange}
          data-testid="checkbox"
        />

        <span className="checkmark">{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
