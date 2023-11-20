/* eslint-disable @typescript-eslint/no-explicit-any */
import { Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { Member, ResultsMembers } from '../../models/member';
import MemberDrawer from './components/MemberDrawer';

const NetworkGraph: React.FC<{ results: ResultsMembers[]}> = ({results}) => {
  
    const [selectedNode, setSelectedNode] = useState<{ id: number; title: string; label: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedExpert, setSelectedExpert] = useState<Member | undefined>(undefined);

    const userIdToNodeIdMap: Record<number, number> = {};
    const scores: number[] = results.flatMap(result =>
        result.recommendation.map(recommendation => recommendation.score || 0)
    );

    const formatName = (name: string) => {
        return name
            .split(/\s+/)
            .map((word) => {
                const hyphenIndex = word.indexOf('-');
                if (hyphenIndex !== -1) {
                    const firstPart = word.slice(0, hyphenIndex + 1);
                    const restOfWord = word.slice(hyphenIndex + 1).charAt(0).toUpperCase() + word.slice(hyphenIndex + 2).toLowerCase();
                    return `${firstPart}${restOfWord}`;
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
            })
            .join(' ');
    };

    const colorScale = d3
        .scaleLinear<string>()
        .domain(d3.extent(scores) as [number, number]  || [0, 1])
        .range(['#13e30b', '#FFA500']);

    const legendColorScale = d3
        .scaleLinear<string>()
        .domain([1, 0.75, 0.5, 0.25, 0])
        .range(['#ff1100','#ff5900','#FFA500', '#FFD700', '#13e30b']);

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
        width?: number;
        margin?: number;
    };

    type Edge = { 
        label: string;
        from: number;
        to: number; 
        width: number;
        color: string;
        font?: {
            align?: 'top' | 'middle' | 'bottom';
            color?: string;
            size?: number;
        };
    };

    results.forEach((result, categoryIndex) => {
        const categoryId = categoryIndex + 1;
      
        GraphData.nodes.push({
            id: categoryId,
            label: result.category,
            title: `Category id ${categoryId}`,
            color: '#FFFFFF',
            shape: 'box',
            margin: 6
        });
        
        result.recommendation.forEach((recommendation) => {
            const userId = recommendation.expert.userId;
        
            let expertNodeId = userIdToNodeIdMap[userId];
        
            if (!expertNodeId) {
                expertNodeId = parseInt(`${categoryId}${recommendation.expert.userId}`);
                userIdToNodeIdMap[userId] = expertNodeId;
            
                const fullName = formatName(`${recommendation.expert.firstName} ${recommendation.expert.lastName}`);
            
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
            const edgeLabel = recommendation.score
                ? `${Math.min(100, Math.round((1 - recommendation.score) * 100))}%`
                : '';
            const edgeColor = colorScale(recommendation.score || 0);
            GraphData.edges.push({
                label: edgeLabel,
                from: categoryId,
                to: expertNodeId,
                width: 2,
                color: edgeColor,
                font: {
                    align: 'middle',
                },
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
        physics:{
            barnesHut:{
                gravitationalConstant: -5000,
                springConstant:0.01,
                avoidOverlap: 0.1,
            }
        },
        smoothCurves: {dynamic:true},
        hideEdgesOnDrag: true,
        stabilize: true,
        stabilizationIterations: 1000,

        autoResize: true,
        height: '100%',
        width: '100%',
        clickToUse: true,
        nodes: {
            shape: 'box',
        },
    };
        
    const events = {
        select: (event: any) => {
            if (event.nodes.length) {
                const nodeId = event.nodes[0];
        
                const selectedNodeData = GraphData.nodes.find((node) => node.id === nodeId);
        
                const expertIndex = results.findIndex((result) =>
                    result.recommendation.some((rec) => userIdToNodeIdMap[rec.expert.userId] === nodeId)
                );
        
                if (selectedNodeData && expertIndex !== -1) {
                    const selectedExpert = results[expertIndex].recommendation.find(
                        (rec) => userIdToNodeIdMap[rec.expert.userId] === nodeId
                    )?.expert;
        
                    setSelectedNode(selectedNodeData || null);
                    setIsDrawerOpen(true);
                    setSelectedExpert(selectedExpert);
                }
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
    };
    
    const legendData = [
        { color: legendColorScale(1), label: '0%' },
        { color: legendColorScale(0.75), label: '25%' },
        { color: legendColorScale(0.5), label: '50%' },
        { color: legendColorScale(0.25), label: '75%' },
        { color: legendColorScale(0), label: '100%' },
    ];
    
    return (
        <Flex
            width={'100%'}
            height={'65vh'}
            justifyContent={'center'}
            alignContent={'center'}
            alignItems={'center'}
            border={'1px solid grey'}
        >
            {/* Legend component */}
            <Flex
                position={'absolute'}
                top={{base:'70px', md:'80px'}}
                left={{base:'none', md:'5vh'}}
                flexDirection={{base:'row', md:'column'}}
                justifyContent={'flex-start'}
                alignItems={'center'}
                zIndex={999}
                backgroundColor={'white'}
                border={'1px solid black'}
                padding={'0.5rem'}
            >
                <Flex
                    display={{base: 'none', md: 'flex'}}
                >
                    {'Correspondance'}
                </Flex>
                {legendData.map((entry, index) => (
                    <Flex 
                        key={index} 
                        width={'100%'}
                        alignItems={'center'}
                        justifyContent={'flex-start'}
                        marginBottom={{base: 0, lg:'0.25rem'}}
                        marginX={{base: '0.15rem', lg:'0rem'}}
                    >
                        <Flex
                            width={'20px'}
                            height={'10px'}
                            backgroundColor={entry.color}
                            marginRight={'5px'}
                        ></Flex>
                        <Flex style={{ fontSize: '12px' }}>{entry.label}</Flex>
                    </Flex>
                ))}
            </Flex>
            <Graph
                graph={GraphData}
                options={options}
                events={events}
            />
            {selectedNode?.title.includes('Expert') && selectedExpert && (
                <MemberDrawer
                    isOpen={isDrawerOpen}
                    setDrawerOpen={setIsDrawerOpen}
                    selectedMember={selectedExpert}
                />
            )}
        </Flex>
    );
};

export default React.memo(NetworkGraph);