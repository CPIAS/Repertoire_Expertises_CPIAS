import { Flex, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';
import { Member } from '../../models/member';

const NetworkGraph: React.FC<{ members: Member[]}> = ({members}) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;
    const [selectedNode, setSelectedNode] = useState<{ id: number, title: string, label: string } | null>(null);

    const [isDrawerOpen, setDrawerOpen] = useState(false);  
    const mockGraphData = {
        nodes: [
            { id: 0, label: query, title: 'id 0', color: '#FFCCCB' },
            ...members.map((member, index) => (
                {
                    id: index + 1,
                    label: member.userId === 0 ? query : `${member.firstName} ${member.lastName}`,
                    title: `id ${index + 1}`,
                    color: '#CCCBFF',
                    jobPosition: member.jobPosition
                }
            ))
        ],
        edges: [
            // { from: 0, to: 3 },
            // { from: 0, to: 5 },
            // { from: 0, to: 5 },
            // { from: 0, to: 6 },
            // { from: 0, to: 7 },
            // { from: 1, to: 3 },
            // { from: 1, to: 6 },
            // { from: 1, to: 7 },
            // { from: 2, to: 4 },
            // { from: 2, to: 5 },
        ] as { from: number; to: number }[]
    };
    
    // for (let i = 0; i < members.length; i++) {
    //     for (let j = i + 1; j < members.length; j++) {
    //         if (members[i].jobPosition === members[j].jobPosition) {
    //             mockGraphData.edges.push({ from: i + 1, to: j + 1 });
    //         }
    //     }
    // }

    const jobPositionMap = new Map();

    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            if (members[i].jobPosition === members[j].jobPosition) {
                const jobPosition = members[i].jobPosition;
                if (!jobPositionMap.has(jobPosition)) {
                    // Create a node for the common job position
                    const newNodeId = mockGraphData.nodes.length + 1;
                    mockGraphData.nodes.push({
                        id: newNodeId,
                        label: jobPosition,
                        title: `id ${newNodeId}`,
                        color: '#FFCCCB',
                    });
                    jobPositionMap.set(jobPosition, newNodeId);
                }
                mockGraphData.edges.push({ from: i + 1, to: jobPositionMap.get(jobPosition) });
                mockGraphData.edges.push({ from: j + 1, to: jobPositionMap.get(jobPosition) });
            }
        }
    }
    
    const options = {
        layout: {
            hierarchical: false,
        },
        edges: {
            arrows: {
                to: { enabled: false, scaleFactor: 1 },
                from: { enabled: false, scaleFactor: 1 },
            },
            color: 'black',
        },
        physics: {
            stabilization: {
                enabled: true,
                iterations: 5000
            }
        },
        autoResize: true,
        height: '100%',
        width: '100%',
        clickToUse: true
    };

    const events = {
        select: (event: any) => {
            if (event.nodes.length) {
                const nodeId = event.nodes[0];
                const selectedNodeData = mockGraphData.nodes.find(node => node.id === nodeId);

                const defaultNodeData = {
                    id: 0,
                    title: 'No title',
                    label: 'No label',
                    ...selectedNodeData
                };

                setSelectedNode(defaultNodeData);
                setDrawerOpen(true);
            }
        },
    };

    return (
        <Flex
            width={'100%'}
            height={'65vh'}
            justifyContent={'center'}
            alignContent={'center'}
            alignItems={'center'}
            border={'1px solid grey'}
        >
            <Graph
                graph={mockGraphData}
                options={options}
                events={events}
            />
            {selectedNode && (
                <Drawer
                    isOpen={isDrawerOpen}
                    placement="right"
                    onClose={() => setDrawerOpen(false)}
                    
                >
                    <DrawerOverlay>
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>{selectedNode.title}</DrawerHeader>
                            <DrawerBody>
                                <Text>{
                                    <Text>
                                    First Name: {members[selectedNode.id - 1].firstName}<br />
                                    Last Name: {members[selectedNode.id - 1].lastName}<br />
                                    Email: {members[selectedNode.id - 1].email}<br />
                                    Subscription Date: {members[selectedNode.id - 1].subscriptionDate}<br />
                                    Affiliation Organization: {members[selectedNode.id - 1].affiliationOrganization}<br />
                                    Community Involvement: {members[selectedNode.id - 1].communityInvolvement}<br />
                                    Job Position: {members[selectedNode.id - 1].jobPosition}<br />
                                    Membership Category: {members[selectedNode.id - 1].membershipCategory}<br />
                                    Membership Category Other: {members[selectedNode.id - 1].membershipCategoryOther}<br />
                                    Skills: {members[selectedNode.id - 1].skills}<br />
                                    Suggestions: {members[selectedNode.id - 1].suggestions}<br />
                                    Years of Experience in Healthcare: {members[selectedNode.id - 1].yearsExperienceHealthcare}<br />
                                    Years of Experience in IA: {members[selectedNode.id - 1].yearsExperienceIa}
                                    </Text>
                                }</Text>
                            </DrawerBody>
                        </DrawerContent>
                    </DrawerOverlay>
                </Drawer>
            )}
        </Flex>
    );
};

export default React.memo(NetworkGraph);