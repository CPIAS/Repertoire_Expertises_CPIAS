import { Select } from '@chakra-ui/react';
import React from 'react';

type Option = {
  value: string;
  label: string;
};

interface SingleSelectDropdownProps {
  options: Option[];
  selectedOption: Option | null;
  onChange: (selectedOption: Option | null) => void;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({ options, selectedOption, onChange }) => {
    return (
        <Select
            value={selectedOption ? selectedOption.value : ''}
            onChange={(e) => {
                const selectedValue = e.target.value;
                const option = options.find((opt) => opt.value === selectedValue) || null;
                onChange(option);
            }}
        >
            <option value="" disabled>
        Select an option
            </option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Select>
    );
};

export default SingleSelectDropdown;
