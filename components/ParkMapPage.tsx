import React, { useState, useMemo, ChangeEvent } from 'react';
import { Property, Tenant, MaintenanceRequest, ParkLayout, MapCell } from '../types';
import RoadIcon from './icons/RoadIcon';
import HomeIcon from './icons/HomeIcon';
import EraserIcon from './icons/EraserIcon';

interface ParkMapPageProps {
    properties: Property[];
    tenants: Tenant[];
    maintenanceRequests: Map<string, MaintenanceRequest[]>;
    parkLayout: ParkLayout;
    onSetParkLayout: (newLayout: ParkLayout) => void;
}

const ParkMapPage: React.FC<ParkMapPageProps> = ({ properties, tenants, maintenanceRequests, parkLayout, onSetParkLayout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tool, setTool] = useState<'road' | 'property' | 'erase'>('erase');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [gridSize, setGridSize] = useState({
        rows: parkLayout.length,
        cols: parkLayout[0]?.length || 0
    });

    const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);

    const placedPropertyIds = useMemo(() => {
        const ids = new Set<string>();
        parkLayout.forEach(row => {
            row.forEach(cell => {
                if (cell.type === 'property') {
                    ids.add(cell.propertyId);
                }
            });
        });
        return ids;
    }, [parkLayout]);

    const unplacedProperties = useMemo(() => {
        return properties.filter(p => !placedPropertyIds.has(p.id));
    }, [properties, placedPropertyIds]);

    const totalUnits = properties.length;
    const occupiedUnits = properties.filter(p => p.tenantId !== null).length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    const handleResizeGrid = () => {
        if (gridSize.rows <= 0 || gridSize.cols <= 0 || gridSize.rows > 50 || gridSize.cols > 50) {
            alert("Please enter valid grid dimensions (1-50).");
            return;
        }

        const newLayout: ParkLayout = Array(gridSize.rows).fill(null).map(() => Array(gridSize.cols).fill({ type: 'empty' }));
        const maxRows = Math.min(gridSize.rows, parkLayout.length);
        const maxCols = Math.min(gridSize.cols, parkLayout[0]?.length || 0);
        for (let r = 0; r < maxRows; r++) {
            for (let c = 0; c < maxCols; c++) {
                newLayout[r][c] = parkLayout[r][c];
            }
        }
        onSetParkLayout(newLayout);
    };

    const handleCellClick = (row: number, col: number) => {
        if (!isEditing) return;

        const newLayout = parkLayout.map(r => r.map(c => ({...c})));
        const currentCell = newLayout[row][col];

        switch (tool) {
            case 'erase':
                newLayout[row][col] = { type: 'empty' };
                break;
            case 'road':
                if (currentCell.type !== 'property') {
                    newLayout[row][col] = { type: 'road' };
                }
                break;
            case 'property':
                if (selectedPropertyId && currentCell.type === 'empty') {
                    // Remove existing instance of this property
                    for(let r=0; r < newLayout.length; r++){
                        for(let c=0; c < newLayout[r].length; c++){
                            const cell = newLayout[r][c];
                            if(cell.type === 'property' && cell.propertyId === selectedPropertyId){
                                newLayout[r][c] = {type: 'empty'};
                            }
                        }
                    }
                    // Place new instance
                    newLayout[row][col] = { type: 'property', propertyId: selectedPropertyId };
                    setSelectedPropertyId('');
                }
                break;
        }
        onSetParkLayout(newLayout);
    };

    const getCellComponent = (cell: MapCell, key: string) => {
        let content = null;
        let className = 'w-full h-12 rounded flex items-center justify-center text-xs font-semibold ';
        
        switch (cell.type) {
            case 'road':
                className += 'bg-gray-400';
                break;
            case 'property':
                const prop = propertyMap.get(cell.propertyId);
                const hasMaint = maintenanceRequests.get(cell.propertyId)?.some(r => r.status === 'Active');
                const isOccupied = prop?.tenantId != null;

                if (hasMaint) {
                    className += `border-4 border-yellow-400 ${isOccupied ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`;
                } else if (isOccupied) {
                    className += 'bg-green-300 text-green-900';
                } else {
                    className += 'bg-blue-300 text-blue-900';
                }
                content = <span>{prop?.lotNumber || '?'}</span>;
                break;
            default: // empty
                className += 'bg-gray-200 hover:bg-gray-300';
        }

        return (
            <button key={key} onClick={() => handleCellClick(Number(key.split('-')[0]), Number(key.split('-')[1]))} className={className} disabled={!isEditing}>
                {content}
            </button>
        );
    };
    
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 border-b pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Park Site Map</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    {isEditing ? 'View Map' : 'Edit Layout'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Total Units</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{totalUnits}</p>
                </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Occupied</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{occupiedUnits}</p>
                </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Vacant</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{totalUnits - occupiedUnits}</p>
                </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 uppercase">Occupied %</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{occupancyRate.toFixed(1)}%</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {isEditing && (
                    <div className="w-full md:w-64 flex-shrink-0 p-4 border rounded-lg bg-gray-50 space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-800">Grid Size</h3>
                            <div className="flex gap-2 mt-2">
                                <input type="number" value={gridSize.rows} onChange={(e) => setGridSize(s => ({...s, rows: parseInt(e.target.value,10)}))} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Rows" />
                                <input type="number" value={gridSize.cols} onChange={(e) => setGridSize(s => ({...s, cols: parseInt(e.target.value,10)}))} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Cols" />
                            </div>
                            <button onClick={handleResizeGrid} className="w-full mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">Apply Size</button>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Tools</h3>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <button onClick={() => setTool('road')} className={`p-2 rounded-md flex justify-center transition-colors ${tool === 'road' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Draw Roads">
                                    <RoadIcon className="w-6 h-6"/>
                                </button>
                                <button onClick={() => setTool('property')} className={`p-2 rounded-md flex justify-center transition-colors ${tool === 'property' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Place Property">
                                    <HomeIcon className="w-6 h-6"/>
                                </button>
                                <button onClick={() => setTool('erase')} className={`p-2 rounded-md flex justify-center transition-colors ${tool === 'erase' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Erase">
                                    <EraserIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                        {tool === 'property' && (
                            <div>
                                <h3 className="font-semibold text-gray-800">Place Property</h3>
                                <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} className="mt-2 w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="">Select a lot...</option>
                                    {unplacedProperties.map(p => (
                                        <option key={p.id} value={p.id}>Lot #{p.lotNumber}</option>
                                    ))}
                                </select>
                                {unplacedProperties.length === 0 && <p className="text-xs text-gray-500 mt-1">All properties are placed.</p>}
                            </div>
                        )}
                    </div>
                )}
                <div className="flex-grow">
                    <div
                        className="grid gap-1 bg-white p-1 rounded-lg border-2 border-gray-300 overflow-auto"
                        style={{ gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` }}
                    >
                        {parkLayout.map((row, r_idx) => 
                            row.map((cell, c_idx) => getCellComponent(cell, `${r_idx}-${c_idx}`))
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-300"></div><span>Vacant</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-300"></div><span>Occupied</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-4 border-yellow-400"></div><span>Maintenance</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-400"></div><span>Road</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkMapPage;