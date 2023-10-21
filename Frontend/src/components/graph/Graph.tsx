import { Flex } from '@chakra-ui/react';
import React from 'react';
import Graph from 'react-graph-vis';

type Node = {
    id: number;
    label: string;
    color?: string;
};

type Edge = {
    from: number;
    to: number;
};

type NetworkGraph = {
    nodes: Node[];
    edges: Edge[]
}

const NetworkGraph: React.FC = () => {
    const mockGraphData = {
        nodes: [
            { id: 0, label: 'Artificial Intelligence', color: '#FFCCCB', shapes: 'square', size: 50 },
            { id: 1, label: 'Brain Imaging', color: '#FFCCCB', shapes: 'square', size: 50 },
            { id: 2, label: 'Data Analysis', color: '#FFCCCB', shapes: 'square', size: 50 },
            { id: 3, label: 'John Doe', shapes: 'square', size: 50 },
            { id: 4, label: 'Jane Smith', shapes: 'square', size: 50 },
            { id: 5, label: 'Marcus Brady', shapes: 'square', size: 50 },
            { id: 6, label: 'Thomas Johnson', shapes: 'square', size: 50 },
            { id: 7, label: 'Jonathan William', shapes: 'square', size: 50 }
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
        nodes: {
            shapes: 'square',
            size: 50
        },
        autoResize: true,
        height: '100%',
        width: '100%',
        clickToUse: true
    };

    const events = {
        select: function (event: any) {
            const { nodes, edges } = event;
        }
    };

    return (
        <Flex
            width={'100%'}
            height={'50vh'}
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
        </Flex>
    );
};

export default NetworkGraph;
