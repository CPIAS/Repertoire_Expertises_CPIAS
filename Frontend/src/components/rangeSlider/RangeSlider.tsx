import {
    Flex,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Text,
    Tooltip
} from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';

interface RangeSliderWithLabelsProps {
    min: number;
    max: number;
    selectedValues: [number, number];
    setSelectedValues: (values: [number, number]) => void;
}

const RangeSliderWithLabels: React.FC<RangeSliderWithLabelsProps> = ({
    min,
    max,
    selectedValues,
    setSelectedValues,
}) => {

    const handleRangeChange = (values: [number, number]) => {
        setSelectedValues(values);
    };
    
    return (
        <Flex width={'100%'} flexWrap={'wrap'} justifyContent={'space-evenly'}>
            <Flex width={'5%'} justifyContent={'flex-start'} paddingRight={'1rem'}>
                <Text>
                    {min}
                </Text>
            </Flex>
            <Flex width={'90%'} justifyContent={'center'} paddingX={'1rem'}>
                <RangeSlider
                    min={min}
                    max={max}
                    step={1}
                    aria-label={['min', 'max']}
                    defaultValue={selectedValues}
                    value={selectedValues}
                    onChange={handleRangeChange}
                    style={{
                        position: 'relative',
                    }}
                >
                    <RangeSliderTrack bg={colors.blue.lighter}>
                        <RangeSliderFilledTrack bg={colors.blue.light}/>
                    </RangeSliderTrack>
                    <Tooltip label={String(selectedValues[0])} hasArrow placement="top">
                        <RangeSliderThumb boxSize={4} index={0} backgroundColor={colors.blue.main} />
                    </Tooltip>
                    <Tooltip label={String(selectedValues[1])} hasArrow placement='top'>
                        <RangeSliderThumb boxSize={4} index={1} backgroundColor={colors.blue.main}>
                        </RangeSliderThumb>
                    </Tooltip>
                </RangeSlider>
            </Flex>
            <Flex width={'5%'} justifyContent={'flex-end'} paddingLeft={'1rem'}>
                <Text>
                    {max}
                </Text>
            </Flex>
        </Flex>
    );
};

export default RangeSliderWithLabels;
