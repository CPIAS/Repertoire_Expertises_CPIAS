import { Flex, Button } from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';

const NetworkGraph: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;

    const graph = {
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

    const graphRef = useRef<HTMLDivElement | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const events = {
        select: function (event: any) {
            const { nodes, edges } = event;
        }
    };

    const handleZoomIn = () => {
        if (graphRef.current) {
            const newZoom = zoomLevel * 1.1; // Increase the zoom level
            setZoomLevel(newZoom);
            updateGraphZoom(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            const newZoom = zoomLevel * 0.9; // Decrease the zoom level
            setZoomLevel(newZoom);
            updateGraphZoom(newZoom);
        }
    };

    const handleResetZoom = () => {
        if (graphRef.current) {
            setZoomLevel(1); // Reset zoom to 1
            updateGraphZoom(1);
        }
    };

    const updateGraphZoom = (zoom: number) => {
        if (graphRef.current) {
            graphRef.current.style.transform = `scale(${zoom})`;
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
            position="relative"
        >
            <div ref={graphRef}>
                <Graph
                    graph={graph}
                    options={options}
                    events={events}
                />
            </div>

            <Flex
                position="absolute"
                top={4}
                right={4}
                flexDirection="column"
            >
                <Button onClick={handleZoomIn} fontSize="2xl">
                    +
                </Button>
                <Button onClick={handleZoomOut} fontSize="2xl">
                    -
                </Button>
                <Button onClick={handleResetZoom} fontSize="2xl">
                    ⟲
                </Button>
            </Flex>
        </Flex>
    );
};

export default React.memo(NetworkGraph);
