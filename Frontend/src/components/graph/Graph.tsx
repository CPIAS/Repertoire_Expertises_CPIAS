/* eslint-disable @typescript-eslint/no-explicit-any */
import { Flex} from '@chakra-ui/react';
import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';
import { ResultsMembers } from '../../models/member';
import * as d3 from 'd3';
// import MemberDrawer from './components/MemberDrawer';

const NetworkGraph: React.FC<{ results: ResultsMembers[]}> = ({results}) => {
  
    const [selectedNode, setSelectedNode] = useState<{ id: number; title: string; label: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const userIdToNodeIdMap: Record<number, number> = {};
    const redScale = d3.scaleLinear<string, number>().domain([0, 0.5]).range(['#ff0000', '#ff0000']);
    const greenScale = d3.scaleLinear<string, number>().domain([0.8, 1]).range(['#ff0000', '#00ff00']);

    const GraphData = {
        nodes: [] as Node[],
        edges: [] as Edge[],
    };

    type Node = {
        id: number;
        label: string;
        title: string;
        color: string | { border: string; background: string };
        shape: string;
        borderRadius?: number;
        width?: number; // Add the width property for edge thickness
        margin?: number;
    };

    type Edge = { 
        from: number;
        to: number; 
        width: number,
        color: number
    };

    results.forEach((result, categoryIndex) => {
        const categoryId = categoryIndex + 1;
      
        // Create a node for the category
        GraphData.nodes.push({
            id: categoryId,
            label: result.category,
            title: `Category id ${categoryId}`,
            color: '#FFFFFF',
            shape: 'box',
            // margin: 6
        });
        
        result.recommendation.forEach((recommendation, expertIndex) => {
            const  userId  = recommendation.expert.userId;
        
            // Check if the expert with the same userId already has a node
            let expertNodeId = userIdToNodeIdMap[userId];
        
            if (!expertNodeId) {
                // If not, create a new node
                expertNodeId = categoryId * 100 + expertIndex + 1;
                userIdToNodeIdMap[userId] = expertNodeId;
            
                const fullName = `${recommendation.expert.firstName} ${recommendation.expert.lastName}`;
            
                GraphData.nodes.push({
                    id: expertNodeId,
                    label: fullName,
                    title: `Expert id ${expertNodeId}`,
                    color: {
                        border: '#F2810C',
                        background: '#FEEBC8',
                    },
                    shape: 'box',
                    borderRadius: 100,
                });
            }
            const edgeColor =
        recommendation.score && recommendation.score < 0.5
            ? redScale(recommendation.score)
            : greenScale(recommendation.score || 0.5);

            GraphData.edges.push({
                from: categoryId,
                to: expertNodeId,
                width: 2,
                color: edgeColor
            });
        });
    });
      
    const options = {
        layout: {
            hierarchical: false,
        },
        interaction:{
            hover:true
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
                iterations: 5000,
            },
        },
        autoResize: true,
        height: '100%',
        width: '100%',
        clickToUse: true,
        nodes: {
            shape: 'box',
        },
    };
        
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const events = {
        // select: (event: any) => {
        //     if (event.nodes.length) {
        //         const nodeId = event.nodes[0];
        //         const selectedNodeData = GraphData.nodes.find((node) => node.id === nodeId);
        
        //         setSelectedNode(selectedNodeData || null);
        //         setIsDrawerOpen(true);
        //     }
        // },
        select: (event: any) => {
            if (event.nodes.length) {
                const nodeId = event.nodes[0];
                const selectedNodeData = GraphData.nodes.find((node) => node.id === nodeId);
    
                // Find the correct index in the results array based on the selected node's ID
                const index = GraphData.nodes.findIndex((node) => node.id === nodeId);
    
                setSelectedIndex(index);
                setSelectedNode(selectedNodeData || null);
                setIsDrawerOpen(true);
            }
        },
        hoverNode: (event: any) => {
            const nodeId = event.node;
            const selectedNodeData = GraphData.nodes.find((node) => node.id === nodeId);
            if (selectedNodeData) {
                const updatedNodes = GraphData.nodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, font: { bold: true } }
                        : { ...node, font: { bold: false } }
                );
        
                GraphData.nodes = updatedNodes;
            }
        },
        blurNode: (event: any) => {
            const nodeId = event.node;
            const selectedNodeData = GraphData.nodes.find((node) => node.id === nodeId);
            if (selectedNodeData) {
                const updatedNodes = GraphData.nodes.map((node) =>
                    node.id === nodeId ? { ...node, font: { bold: false } } : node
                );

                GraphData.nodes = updatedNodes;
            }
        },
        zoom: (event: any) => {
            setZoomLevel(event.scale);
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
                graph={GraphData}
                options={options}
                events={events}
            />
            {/* {selectedNode?.title.includes('Member') && (
                <MemberDrawer 
                    selectedMember={results[selectedIndex] || undefined}
                    isOpen={isDrawerOpen} 
                    setDrawerOpen={setIsDrawerOpen}
                />
               
            )} */}
        </Flex>
    );
};

export default React.memo(NetworkGraph);