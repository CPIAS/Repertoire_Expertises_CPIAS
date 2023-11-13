/* eslint-disable @typescript-eslint/no-explicit-any */
import { Flex} from '@chakra-ui/react';
import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { useSearchParams } from 'react-router-dom';
import { Member } from '../../models/member';
import MemberDrawer from './components/MemberDrawer';

const NetworkGraph: React.FC<{ members: Member[]}> = ({members}) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const tagsMap = new Map();
    
    const [selectedNode, setSelectedNode] = useState<{ id: number; title: string; label: string } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    console.log(members);
    
    const limitedMembers = members.slice(0, 15);
    type Node = {
        id: number;
        label: string;
        title: string;
        color: string | { border: string; background: string };
        shape: string;
        tags?: string[];
        borderRadius?: number;
      };
    
    const createMemberNode = (member: Member, index: number): Node => ({
        id: index + 1,
        label: member.userId === 0 ? query : `${member.firstName} ${member.lastName}`,
        title: `Member id ${index + 1}`,
        color: '#17b978',
        shape: 'ellipse',
        tags: member.tags.split(',').map((tag) => tag.trim()),
    });
        
    const createTagNode = ([tag, nodeId]: [string, number]): Node => ({
        id: nodeId,
        label: tag,
        title: `Tag id ${nodeId}`,
        color: {
            border: '#F2810C',
            background: '#CCCBFF',
        },
        shape: '',
        
    });
        
    const mockGraphData = {
        nodes: [
            ...limitedMembers.map(createMemberNode),
            ...Array.from(tagsMap.entries()).map(createTagNode),
        ],
        edges: [] as { from: number; to: number }[],
    };
        
    for (let i = 0; i < limitedMembers.length; i++) {
        const tagsA = limitedMembers[i].tags.split(',').map((tag) => tag.trim());
        
        for (let j = 0; j < tagsA.length; j++) {
            const tagA = tagsA[j];
        
            if (!tagA) {
                continue;
            }
        
            const splitTags = tagA.split('et').map((tag) => tag.trim());
        
            splitTags.forEach((tagB) => {
                if (!tagsMap.has(tagB)) {
                    const newNodeId = mockGraphData.nodes.length + 1;
                    mockGraphData.nodes.push({
                        id: newNodeId,
                        label: tagB,
                        title: `Tag id ${newNodeId}`,
                        color: {
                            border: '#F2810C',
                            background: '#FEEBC8',
                        },
                        shape: 'box',
                        borderRadius: 100,
                    });
                    tagsMap.set(tagB, newNodeId);
                }
        
                mockGraphData.edges.push({ from: i + 1, to: tagsMap.get(tagB) });
            });
        }
    }
        
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

        zoom: {
            level: zoomLevel,
            enabled: true,
            max: 2,
            min: 0.5,
        },
    };
        
    const events = {
        select: (event: any) => {
            if (event.nodes.length) {
                const nodeId = event.nodes[0];
                const selectedNodeData = mockGraphData.nodes.find((node) => node.id === nodeId);
        
                setSelectedNode(selectedNodeData || null);
                setIsDrawerOpen(true);
            }
        },
        hoverNode: (event: any) => {
            const nodeId = event.node;
            const selectedNodeData = mockGraphData.nodes.find((node) => node.id === nodeId);
            if (selectedNodeData) {
                const updatedNodes = mockGraphData.nodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, font: { bold: true } }
                        : { ...node, font: { bold: false } }
                );
        
                // Update the nodes with the new styling
                mockGraphData.nodes = updatedNodes;
            }
        },
        blurNode: (event: any) => {
            const nodeId = event.node;
            const selectedNodeData = mockGraphData.nodes.find((node) => node.id === nodeId);
            if (selectedNodeData) {
                const updatedNodes = mockGraphData.nodes.map((node) =>
                    node.id === nodeId ? { ...node, font: { bold: false } } : node
                );
        
                // Update the nodes with the new styling
                mockGraphData.nodes = updatedNodes;
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
                graph={mockGraphData}
                options={options}
                events={events}
            />
            {selectedNode?.title.includes('Member') && (
                <MemberDrawer 
                    selectedMember={members[selectedNode.id-1]}
                    isOpen={isDrawerOpen} 
                    setDrawerOpen={setIsDrawerOpen}
                />
               
            )}
        </Flex>
    );
};

export default React.memo(NetworkGraph);