import React, { useState } from 'react';
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { FiUsers, FiStar } from 'react-icons/fi';

const ChamaSelector = ({ chamas, activeChama, setActiveChama }) => {
  return (
    <Dropdown as={ButtonGroup} className="mb-3">
      <Dropdown.Toggle variant="outline-primary">
        {activeChama ? activeChama.name : 'Select Chama'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {chamas.map(chama => (
          <Dropdown.Item 
            key={chama.id} 
            onClick={() => setActiveChama(chama)}
            active={activeChama?.id === chama.id}
          >
            {chama.name}
            {chama.isAdmin && (
              <span className="ms-2">
                <FiStar size={14} className="text-warning" />
              </span>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ChamaSelector;