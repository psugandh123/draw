import React, { useReducer, useState } from 'react';
import Angle from './Angle';
import { GRID_LENGTH, GRID_POINT_RADIUS, TOOLS } from './constants';
import Line from './Line';
import Point from './Point';
import Toolpanel from './Toolpanel';
import { getCoordinates, getNextPointName } from './utils';

export interface Node {
    id: string;
    x: number;
    y: number;
}

export interface Link {
    id: string;
    startNodeId: string;
    endNodeId: string;
}

interface State {
    nodes: { [id: string]: Node };
    links: Link[];
    activeNode: Node | null;
    startNodeId: string | null;
    isDragging: boolean;
}

type Action =
    | { type: 'UPSERT_NODE'; node: Node }
    | { type: 'UPDATE_ACTIVE_NODE'; node: Partial<Node> }
    | { type: 'REMOVE_ACTIVE_NODE' }

    | { type: 'SET_START_NODE'; nodeId: string | null }
    | { type: 'SET_IS_DRAGGING'; isDragging: boolean }
    | { type: 'ADD_LINK'; link: Link }
    | { type: 'MERGE_POINTS'; from: string, to: string; };



const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'UPSERT_NODE':
            return {
                ...state,
                nodes: { ...state.nodes, [action.node.id]: action.node },
            };
        case 'MERGE_POINTS':

            const newNodes = { ...state.nodes };
            delete newNodes[action.from];

            return {
                ...state,
                links: state.links?.filter
                    (link =>
                        !((link.startNodeId === action.from && link.endNodeId === action.to) ||
                            (link.startNodeId === action.to && link.endNodeId === action.from)))
                    .map(link => ({
                        ...link,
                        startNodeId: link.startNodeId === action.from ? action.to : link.startNodeId,
                        endNodeId: link.endNodeId === action.from ? action.to : link.endNodeId,
                    })),
                nodes: newNodes,
                activeNode: null
            };


        case 'UPDATE_ACTIVE_NODE':
            return {
                ...state, activeNode: {
                    ...state.activeNode,
                    ...action.node
                }
            };
        case 'REMOVE_ACTIVE_NODE':
            return {
                ...state, activeNode: null
            };
        case 'SET_START_NODE':
            return { ...state, startNodeId: action.nodeId };
        case 'SET_IS_DRAGGING':
            return { ...state, isDragging: action.isDragging };
        case 'ADD_LINK':
            return { ...state, links: [...state.links, action.link] };
        default:
            return state;
    }
};

const Canvas: React.FC = () => {
    const [currentTool, setCurrentTool] = useState("")
    const [state, dispatch] = useReducer(reducer, {
        nodes: {},
        links: [],
        activeNode: null,
        startNodeId: null,
        isDragging: false,
    });


    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Get the canvas dimensions
        if (currentTool !== TOOLS.LINE) {
            return;
        }
        const canvasRect = e.currentTarget.getBoundingClientRect();

        // Check if the mouse click is within the canvas
        if (
            e.clientX >= canvasRect.left &&
            e.clientX <= canvasRect.right &&
            e.clientY >= canvasRect.top &&
            e.clientY <= canvasRect.bottom
        ) {
            dispatch({ type: 'SET_IS_DRAGGING', isDragging: true });
            const { closest } = getCoordinates(e);
            const existingNode = Object.values(state.nodes).find(
                (node) => node.x === closest.x && node.y === closest.y
            );

            if (existingNode) {
                // Set the existing node as the active node
                dispatch({ type: 'UPDATE_ACTIVE_NODE', node: existingNode });
            } else {
                // Create a new node and set it as the start node
                const newNodeId = getNextPointName(Object.values(state.nodes).length); // Implement a function to get the next point name
                dispatch({
                    type: 'UPSERT_NODE',
                    node: { id: newNodeId, x: closest.x, y: closest.y },
                });
                dispatch({ type: 'SET_START_NODE', nodeId: newNodeId });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {


        if (state.isDragging) {

            const { closest, relative } = getCoordinates(e);
            const existingNode = Object.values(state.nodes).find(
                (node) => node.x === closest.x && node.y === closest.y
            );

            if (state.activeNode) {
                // Update the coordinates of the active node
                dispatch({
                    type: 'UPDATE_ACTIVE_NODE',
                    node: existingNode ? closest : relative
                });
            } else if (state.startNodeId) {
                const finalNode = existingNode && existingNode?.id !== state.startNodeId ? existingNode : {
                    id: getNextPointName(Object.values(state.nodes).length),
                    ...relative
                }
                dispatch({ type: 'UPDATE_ACTIVE_NODE', node: finalNode });
                dispatch({
                    type: 'ADD_LINK',
                    link: {
                        id: `link-${Date.now()}`,
                        startNodeId: state.startNodeId,
                        endNodeId: finalNode.id,
                    },
                });
                dispatch({ type: 'SET_START_NODE', nodeId: null });
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        // Handle mouse up event
        dispatch({ type: 'SET_IS_DRAGGING', isDragging: false });

        if (state.activeNode) {
            const { closest } = getCoordinates(e);
            const existingNode = Object.values(state.nodes).find(
                (node) => node.x === closest.x && node.y === closest.y
            );
            if (existingNode) {
                if (state.activeNode.id !== existingNode.id)
                    dispatch({ type: "MERGE_POINTS", from: state.activeNode.id, to: existingNode.id })

            } else {
                dispatch({ type: "UPSERT_NODE", node: { ...state.activeNode, ...closest } })
            }


        }
        dispatch({ type: "REMOVE_ACTIVE_NODE" });


    };

    const finalNodes = { ...state.nodes, ...(state.activeNode && { [state.activeNode.id]: state.activeNode }) };
    return (
        <div className="flex justify-center flex-col items-center" onClick={() => {
            setCurrentTool("")
        }}>
            <div className='w-[800px] space-y-4' onClick={(e) => {
                e.stopPropagation()
            }}>
                <div
                    className={`relative border border-gray-300  h-[500px] select-none ${currentTool === TOOLS.LINE ? "cursor-move" : ""}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{
                        backgroundImage:
                            `radial-gradient(#D9D9D9 ${GRID_POINT_RADIUS * 2}px, white 1px, white)`,
                        backgroundSize: `${GRID_LENGTH}px ${GRID_LENGTH}px`,
                        backgroundRepeat: 'repeat',
                    }}
                >

                    {!state.isDragging && Object.values(finalNodes).map((node) => {
                        const associatedLinks = state.links.filter(link => link.startNodeId === node.id || link.endNodeId === node.id)
                        return <Point
                            key={node.id}
                            node={node} >
                            {associatedLinks.length > 1 ?
                                associatedLinks.map((linkA, index1) =>
                                    associatedLinks.map((linkB, index2) => index1 < index2 ?
                                        <Angle key={linkA?.id + linkB.id} linkA={linkA} linkB={linkB} nodes={state.nodes} currentNode={node} />
                                        : null)) :
                                null}

                        </Point>
                    })}

                    {state.links.map((link) => (
                        <Line
                            key={link.id}
                            id={link.id}
                            startNode={finalNodes[link.startNodeId]}
                            endNode={finalNodes[link.endNodeId]}

                        />
                    ))}
                </div>
                <Toolpanel setCurrentTool={setCurrentTool} />
            </div>

        </div>
    );
};

export default Canvas;