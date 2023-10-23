import { Flex } from '@chakra-ui/react';
import React from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';

const NetworkGraph: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;
    const mockGraphData = {
        nodes: [
            { id: 0, label: query, color: '#FFCCCB' },
            { id: 1, label: 'Brain Imaging', color: '#FFCCCB' },
            { id: 2, label: 'Data Analysis', color: '#FFCCCB' },
            { id: 3, label: 'John Doe' },
            { id: 4, label: 'Jane Smith' },
            { id: 5, label: 'Marcus Brady' },
            { id: 6, label: 'Thomas Johnson' },
            { id: 7, label: 'Jonathan William' }
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
        select: function (event: any) {
            const { nodes, edges } = event;
        }
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
        </Flex>
    );
};

export default React.memo(NetworkGraph);