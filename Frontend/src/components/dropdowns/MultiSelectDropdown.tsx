import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Checkbox, Flex, Icon, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import colors from '../../utils/theme/colors';

const NUMBER_OF_ITEMS = 25; 
const LOAD_HEIGHT_THRESHOLD = 0.9;

export type DropdownOptions = {
  value: string;
  label: string;
};

interface MultiSelectDropdownProps {
  options: DropdownOptions[];
  unit: string;
  selectedOptions: DropdownOptions[];
  setSelectedOptions: (newSelectedOptions: DropdownOptions[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
    options, 
    unit, 
    selectedOptions, 
    setSelectedOptions 
}) => {
    const [visibleOptions, setVisibleOptions] = useState<DropdownOptions[]>(options.slice(0, NUMBER_OF_ITEMS));
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    /**
     * Handle scroll events for a dropdown component and loads additional items
     * when the user has scrolled to a specified threshold.
     */
    const handleScroll = () => {
        if (dropdownRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
            if (scrollTop + clientHeight >= LOAD_HEIGHT_THRESHOLD * scrollHeight) {
                const numItemsToShow = Math.min(options.length - visibleOptions.length, NUMBER_OF_ITEMS);
                if (numItemsToShow > 0) {
                    setVisibleOptions(prevOptions => [
                        ...prevOptions,
                        ...options.slice(prevOptions.length, prevOptions.length + numItemsToShow)
                    ]);
                }
            }
        }
    };

    /**
     * Set up an event listener for scrolling on the dropdown element.
     */
    useEffect(() => {
        if (dropdownRef.current) {
            dropdownRef.current.addEventListener('scroll', handleScroll);
            return () => {
                if (dropdownRef.current) {
                    dropdownRef.current.removeEventListener('scroll', handleScroll);
                }
            };
        }
    }, [visibleOptions, options]);

    /**
     * Select the "All" option in the list (always the first one)
     */
    const handleSelectAll = () => {
        setSelectedOptions([options[0]]);
    };

    /**
     * Handle the selection of options in the list, including special handling for the "All" option.
     */
    const handleSelectOption = useCallback((option: DropdownOptions) => {
        if (option.value === 'Tous') {
            handleSelectAll();
        } else {
            if (selectedOptions.some((selected) => selected.value === 'Tous')) {
                setSelectedOptions([option]);
            } else {
                const isOptionSelected = selectedOptions.some((selected) => selected.value === option.value);
                if (isOptionSelected) {
                    setSelectedOptions(selectedOptions.filter((selected) => selected.value !== option.value));
                } else {
                    setSelectedOptions([...selectedOptions, option]);
                }
            }
        }
    }, [selectedOptions]);

    /**
     * Generate the label of the dropdown button based on the selected option(s).
     *
     * @returns {string} The label containing the selected options.
     */
    const getButtonLabel = () => {
        if (selectedOptions.length === 1 && selectedOptions[0].value === 'Tous') {
            return 'Tous';
        } else if (selectedOptions.length === 1) {
            return selectedOptions[0].label;
        } else if (selectedOptions.length > 1) {
            return `${selectedOptions.length} ${unit}`;
        } 
        else {
            handleSelectAll();
            return 'Tous';
        }
    };

    /**
     * Handles the click event for a dropdown menu item, preventing the default action
     * and triggering the selection of the corresponding option.
     *
     * @param {DropdownOptions} option - The option associated with the clicked menu item.
     * @param {React.MouseEvent} e - The React MouseEvent object.
     */
    const handleMenuItemClick = (option: DropdownOptions) => (e: React.MouseEvent) => {
        e.preventDefault();
        handleSelectOption(option);
    };

    return (
        <Flex width={'100%'}>
            <Menu closeOnSelect={false} matchWidth>
                <MenuButton
                    rightIcon={<Icon as={ChevronDownIcon} />}
                    width={'100%'}
                    as={Button}
                    size={'md'}
                    backgroundColor={colors.darkAndLight.white}
                    color={colors.blue.main}
                    fontWeight={'normal'}
                    border={`1px solid ${colors.grey.lighter}`}
                    _hover={{
                        backgroundColor: colors.blue.lighter,
                        border: `2px solid ${colors.blue.light2}`,
                    }}
                    _active={{
                        backgroundColor: colors.blue.lighter,
                        border: `2px solid ${colors.blue.light}`,
                    }}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {getButtonLabel()}
                </MenuButton>

                <MenuList padding={'0'} maxHeight={'35vh'} overflowY={'scroll'} zIndex={5} ref={dropdownRef}>
                    {visibleOptions.map((option) => (
                        <MenuItem key={option.value} onClick={handleMenuItemClick(option)} paddingY={'0.5rem'}>
                            <Checkbox
                                isChecked={selectedOptions.some((selected) => selected.value === option.value)}
                                onChange={() => handleSelectOption(option)}
                                paddingRight={'0.75rem'}
                            />
                            <Text
                                maxWidth="100%"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                {option.label}
                            </Text>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Flex>
    );
};

export default MultiSelectDropdown;
