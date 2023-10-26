import { Flex, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';

const NetworkGraph: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;
    const [selectedNode, setSelectedNode] = useState<{ id: number, title: string, label: string } | null>(null);

    const [isDrawerOpen, setDrawerOpen] = useState(false);  
    const mockGraphData = {
        nodes: [
            { id: 0, label: query, title: 'id 0', color: '#FFCCCB' },
            { id: 1, label: 'Brain Imaging', title: 'id 1', color: '#FFCCCB' },
            { id: 2, label: 'Data Analysis', title: 'id 2', color: '#FFCCCB' },
            { id: 3, label: 'John Doe', title: 'id 3' },
            { id: 4, label: 'Jane Smith', title: 'id 4' },
            { id: 5, label: 'Marcus Brady', title: 'id 5' },
            { id: 6, label: 'Thomas Johnson', title: 'id 6' },
            { id: 7, label: 'Jonathan William', title: 'id 7' }
        ],
        edges: [
            { from: 0, to: 3 },
            { from: 0, to: 5 },
            { from: 0, to: 5 },
            { from: 0, to: 6 },
            { from: 0, to: 7 },
            { from: 1, to: 3 },
            { from: 1, to: 6 },
            { from: 1, to: 7 },
            { from: 2, to: 4 },
            { from: 2, to: 5 },
        ]
    };
    
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
                                <Text>{selectedNode.label}</Text>
                            </DrawerBody>
                        </DrawerContent>
                    </DrawerOverlay>
                </Drawer>
            )}
        </Flex>
    );
};

export default React.memo(NetworkGraph);