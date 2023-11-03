import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react';
import { memberTypeDropdownOptions } from '../../data/category';
import { organisationsDropdownOptions } from '../../data/organisations';
import { IFilters } from '../../models/filters';
import colors from '../../utils/theme/colors';
import MultiSelectDropdown, { DropdownOptions } from '../dropdowns/MultiSelectDropdown';
import RangeSliderWithLabels from '../rangeSlider/RangeSlider';

type FiltersProps = {
    isOpen: boolean;
    setIsFilterSectionShown: (isShown: boolean) => void;
    setAppliedFilters: (filters: IFilters | undefined) => void;
};

const Filters: React.FC<FiltersProps> = ({
    isOpen,
    setIsFilterSectionShown,
    setAppliedFilters
}) => {
    const { onClose } = useDisclosure();
    const [selectedOrganisation, setSelectedOrganisation] = useState<DropdownOptions[]>([{value: 'Tous', label: 'Tous'}]);
    const [selectedExpertise, setSelectedExpertise] = useState<DropdownOptions[]>([{value: 'Tous', label: 'Tous'}]);
    const [selectedMemberType, setSelectedMemberType] = useState<DropdownOptions[]>([{value: 'Tous', label: 'Tous'}]);
    const [selectedAiExperience, setSelectedAiExperience] = useState<[number, number]>([0, 50]);
    const [selectedHealthExperience, setSelectedHealthExperience] = useState<[number, number]>([0, 50]);

    const resetFilters = () => {
        setSelectedOrganisation([{value: 'Tous', label: 'Tous'}]);
        setSelectedExpertise([{value: 'Tous', label: 'Tous'}]);
        setSelectedMemberType([{value: 'Tous', label: 'Tous'}]);
        setSelectedAiExperience([0, 50]);
        setSelectedHealthExperience([0, 50]);
    };

    const applyFilters = () => {
        let appliedFilters: IFilters | undefined = {organisation:[], expertise: [], memberType: [], aiExperience: [], healthExperience: []};
        for (const organisation of selectedOrganisation) {
            if (organisation.label !== 'Tous')
                appliedFilters.organisation?.push(organisation.label);
        }
        for (const expertise of selectedExpertise) {
            if (expertise.label !== 'Tous')
                appliedFilters.expertise?.push(expertise.label);
        }
        for (const memberType of selectedMemberType) {
            if (memberType.label !== 'Tous')
                appliedFilters.memberType?.push(memberType.label);
        }
        if (selectedAiExperience[0] !== 0 || selectedAiExperience[1] !== 50)
            appliedFilters.aiExperience?.push(selectedAiExperience[0], selectedAiExperience[1]);

        if (selectedHealthExperience[0] !== 0 || selectedHealthExperience[1] !== 50)
            appliedFilters.healthExperience?.push(selectedHealthExperience[0], selectedHealthExperience[1]);

        if (appliedFilters.organisation?.length === 0 
            && appliedFilters.expertise?.length === 0 
            && appliedFilters.memberType?.length === 0 
            && appliedFilters.aiExperience?.length === 0 
            && appliedFilters.healthExperience?.length === 0
        ) {
            appliedFilters = undefined;
        }
        setAppliedFilters(appliedFilters);
        setIsFilterSectionShown(false);
    };

    return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            size={'lg'}
            onClose={onClose}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton onClick={()=> {
                    setIsFilterSectionShown(false);
                }}/>
                <DrawerHeader borderBottomWidth='1px'>
                    {'Appliquer des filtres'}
                </DrawerHeader>

                <DrawerBody
                    paddingX={'1rem'}
                    
                >
                    <Flex
                        width={'100%'}
                        paddingTop={'1.5rem'}
                        justifyContent={'flex-start'}
                        flexWrap={'wrap'}
                        gap={'1rem'}
                    >
                    
                        <Flex
                            width={'100%'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'} 
                                paddingBottom={'0.25rem'}
                                borderBottomWidth='1px'
                                fontSize={'md'}
                                fontWeight={'bold'}
                            >
                                {'Organisation'}
                            </Flex>
                            <MultiSelectDropdown 
                                options={organisationsDropdownOptions}
                                unit={'organisations'}
                                selectedOptions={selectedOrganisation}
                                setSelectedOptions={setSelectedOrganisation}
                            />
                        </Flex>
                        <Flex
                            width={'100%'}
                            paddingTop={'1.5rem'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'} 
                                paddingBottom={'0.25rem'}
                                borderBottomWidth='1px'
                                fontSize={'md'}
                                fontWeight={'bold'}
                            >
                                {'Type d\'expertise'}
                            </Flex>
                            <MultiSelectDropdown 
                                options={memberTypeDropdownOptions} //TODO: LOAD REAL TAGS
                                unit={'types'}
                                selectedOptions={selectedExpertise}
                                setSelectedOptions={setSelectedExpertise}
                            />
                        </Flex>
                        <Flex
                            width={'100%'}
                            paddingTop={'1.5rem'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'} 
                                paddingBottom={'0.25rem'}
                                borderBottomWidth='1px'
                                fontSize={'md'}
                                fontWeight={'bold'}
                            >
                                {'Type de membre'}
                            </Flex>
                            <MultiSelectDropdown 
                                options={memberTypeDropdownOptions}
                                unit={'types'}
                                selectedOptions={selectedMemberType}
                                setSelectedOptions={setSelectedMemberType}
                            />
                        </Flex>
                        <Flex
                            width={'100%'}
                            paddingTop={'1.5rem'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'} 
                                paddingBottom={'0.25rem'}
                                borderBottomWidth='1px'
                                fontSize={'md'}
                                fontWeight={'bold'}
                            >
                                {'Années d\'expérience en intelligence artificielle'}
                            </Flex>
                            <RangeSliderWithLabels
                                min={0}
                                max={50}
                                selectedValues={selectedAiExperience}
                                setSelectedValues={setSelectedAiExperience}
                            />
                        </Flex>
                        <Flex
                            width={'100%'}
                            paddingTop={'1.5rem'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'} 
                                paddingBottom={'0.25rem'}
                                borderBottomWidth='1px'
                                fontSize={'md'}
                                fontWeight={'bold'}
                            >
                                {'Années d\'expérience en santé'}
                            </Flex>
                            <RangeSliderWithLabels
                                min={0}
                                max={50}
                                selectedValues={selectedHealthExperience}
                                setSelectedValues={setSelectedHealthExperience}
                            />
                        </Flex>
                    </Flex>
                </DrawerBody>
                <Flex 
                    padding={'1rem'}
                >
                    <Button
                        size={'md'}
                        backgroundColor={colors.darkAndLight.white}
                        color={colors.blue.main}
                        border={`1px solid ${colors.grey.lighter}`}
                        _hover={{
                            backgroundColor: colors.blue.lighter,
                        }}
                        _active={{
                            backgroundColor: colors.blue.lighter,
                        }}
                        onClick={()=>resetFilters()}
                    >
                        {'Réinitialiser les filtres'}
                    </Button>
                </Flex>
                <DrawerFooter borderTopWidth='1px'>
                    <Flex gap={'1rem'}>
                        <Button 
                            size={'lg'}
                            backgroundColor={colors.darkAndLight.white}
                            color={colors.blue.main}
                            border={`1px solid ${colors.grey.lighter}`}
                            _hover={{
                                backgroundColor: colors.blue.lighter,
                            }}
                            _active={{
                                backgroundColor: colors.blue.lighter,
                            }}
                            onClick={()=> {
                                setIsFilterSectionShown(false);
                            }}
                        >
                            {'Annuler'}
                        </Button>
                        <Button 
                            size={'lg'}
                            backgroundColor={colors.blue.main}
                            color={colors.darkAndLight.white}
                            _hover={{
                                backgroundColor: colors.blue.light,
                            }}
                            _active={{
                                backgroundColor: colors.blue.light,
                            }} 
                            onClick={()=> {
                                applyFilters();
                            }}
                        >
                            {'Appliquer'}
                        </Button>
                    </Flex>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
       
    );
};

export default Filters;