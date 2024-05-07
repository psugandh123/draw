import { link } from 'fs';
import React, { useEffect, useReducer, useState } from 'react';
import Angle from './Angle';
import { GRID_LENGTH, GRID_POINT_RADIUS, TOOLS } from './constants';
import Line from './Line';
import Point from './Point';
import Toolpanel from './Toolpanel';
import { getCoordinates, getNextPointName, InteractionEvent, isActionWIthinCanvas, removeDuplicateLinks } from './utils';

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
    | { type: 'REMOVE_ACTIVE_NODE_LINK' }


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
            //For merging, remove old point
            const newNodes = { ...state.nodes };
            delete newNodes[action.from];
            //Remove old points with the new point in all the links. Remove links with same start and end points

            const links = state.links?.map(link => ({
                ...link,
                startNodeId: link.startNodeId === action.from ? action.to : link.startNodeId,
                endNodeId: link.endNodeId === action.from ? action.to : link.endNodeId,
            })).filter
                (link => link.startNodeId !== link.endNodeId)
            return {
                ...state,
                links: removeDuplicateLinks(links),
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
        case 'REMOVE_ACTIVE_NODE_LINK':
            return {
                ...state,
                activeNode: null,
                links: state.links?.filter
                    (link => !(link.startNodeId === state.activeNode?.id || link.endNodeId === state.activeNode?.id))
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




    const canvasRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const handleMouseDown = (e: InteractionEvent) => {
            console.log("In")
            if (!isActionWIthinCanvas(e)) {
                return;
            }

            const { closest } = getCoordinates(e);
            const existingNode = Object.values(state.nodes).find(
                (node) => node.x === closest.x && node.y === closest.y
            );

            if (existingNode && currentTool === TOOLS.MOVE) {
                dispatch({ type: 'SET_IS_DRAGGING', isDragging: true });
                dispatch({ type: 'UPDATE_ACTIVE_NODE', node: existingNode });
            } else if (currentTool === TOOLS.LINE) {
                dispatch({ type: 'SET_IS_DRAGGING', isDragging: true });

                if (existingNode) {

                    dispatch({ type: 'SET_START_NODE', nodeId: existingNode.id });
                } else {
                    const newNodeId = getNextPointName(Object.keys(state.nodes));
                    dispatch({
                        type: 'UPSERT_NODE',
                        node: { id: newNodeId, x: closest.x, y: closest.y },
                    });
                    dispatch({ type: 'SET_START_NODE', nodeId: newNodeId });
                }
            }
        };

        const handleMouseMove = (e: InteractionEvent) => {
            console.log("Move")

            if (!isActionWIthinCanvas(e)) {
                return
            }
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
                        id: getNextPointName(Object.keys(state.nodes)),
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

        const handleMouseUp = (e: InteractionEvent) => {

            dispatch({ type: 'SET_IS_DRAGGING', isDragging: false });

            if (!isActionWIthinCanvas(e)) {
                dispatch({ type: "REMOVE_ACTIVE_NODE_LINK" });
                return
            }

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

        canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
        canvas.addEventListener('mousemove', handleMouseMove, { passive: false });
        canvas.addEventListener('mouseup', handleMouseUp, { passive: false });
        canvas.addEventListener('touchstart', handleMouseDown, { passive: false });
        canvas.addEventListener('touchmove', handleMouseMove, { passive: false });
        canvas.addEventListener('touchend', handleMouseUp, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', handleMouseDown);
            canvas.removeEventListener('touchmove', handleMouseMove);
            canvas.removeEventListener('touchend', handleMouseUp);
        };
    }, [currentTool, state.activeNode, state.isDragging, state.links, state.nodes, state.startNodeId]);

    const finalNodes = { ...state.nodes, ...(state.activeNode && { [state.activeNode.id]: state.activeNode }) };
    return (
        <div className="flex justify-center flex-col items-center"
            onClick={() => {
                setCurrentTool(undefined)
            }}

        >
            <div className='w-full gap-4 flex flex-col h-[100vh] py-20 max-w-[400px]  '>
                <div
                    ref={canvasRef}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}

                    className={`relative border border-gray-300 flex-grow select-none  touch-none ${currentTool === TOOLS.LINE ? "cursor-crosshair" : ""}`}
                    onContextMenu={(e) => {
                        e.preventDefault()
                    }}
                    {...{ passive: false }}
                    style={{
                        backgroundImage:
                            `radial-gradient(#D9D9D9 ${GRID_POINT_RADIUS * 2}px, white 1px, white)`,
                        backgroundSize: `${GRID_LENGTH}px ${GRID_LENGTH}px`,
                        backgroundRepeat: 'repeat',
                    }}
                >

                    {Object.values(finalNodes).map((node) => {
                        const associatedLinks = state.links.filter(link => link.startNodeId === node.id || link.endNodeId === node.id)
                        return <Point
                            currentTool={currentTool}

                            key={node.id}
                            node={node} >
                            {associatedLinks.length > 1 ?
                                associatedLinks.map((linkA, index1) =>
                                    associatedLinks.map((linkB, index2) => index1 < index2 ?
                                        <Angle isDragging={state.isDragging} key={linkA?.id + linkB.id} linkA={linkA} linkB={linkB} nodes={state.nodes} currentNode={node} />
                                        : null)) :
                                null}

                        </Point>
                    })}

                    {state.links.map((link) => (
                        <Line
                            isDragging={state.isDragging}
                            key={link.id}
                            id={link.id}
                            startNode={finalNodes[link.startNodeId]}
                            endNode={finalNodes[link.endNodeId]}

                        />
                    ))}
                </div>
                <Toolpanel setCurrentTool={setCurrentTool} currentTool={currentTool} />
            </div>

        </div>
    );
};

export default Canvas;