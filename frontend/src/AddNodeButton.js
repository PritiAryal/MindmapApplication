import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const AddNodeButton = ({ onAddRootNode }) => {
    const handleClick = (event) => {
        event.preventDefault(); // Prevent default behavior
        event.stopPropagation(); // Stop event from propagating to the canvas

        console.log('Button clicked');
        const newNode = {
            id: `${Date.now()}`,
            type: 'custom',
            data: { label: `Root Node ${Date.now()}`, children: [] },
            position: { x: 250, y: 250 },
        };

        onAddRootNode(newNode);
    };

    return (
        <button
            style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#007bff',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 1000 // Ensure the button is above the canvas
            }}
            onClick={handleClick}
        >
            <FontAwesomeIcon icon={faPlus} />
        </button>
    );
};

export default AddNodeButton;
