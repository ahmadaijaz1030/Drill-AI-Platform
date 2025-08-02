import React from 'react';
import styled from 'styled-components';
import { FiMapPin } from 'react-icons/fi';

const WellListContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const WellListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const WellListTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const WellListContent = styled.div`
  /* No specific styles needed here, as the items are styled directly */
`;

const WellItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#eff6ff' : 'white'};
  border-left: 4px solid ${props => props.selected ? '#3b82f6' : 'transparent'};
  position: relative;

  &:hover {
    background: ${props => props.selected ? '#eff6ff' : '#f8fafc'};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const WellName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const UploadIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.hasData ? '#10b981' : '#e2e8f0'};
  flex-shrink: 0;
`;

const WellDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;

  @media (max-width: 768px) {
    margin-top: 6px;
  }

  @media (max-width: 480px) {
    margin-top: 4px;
  }
`;

const WellDepth = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const WellStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#f0fdf4';
      case 'completed': return '#f0f9ff';
      case 'planned': return '#fef3c7';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#16a34a';
      case 'completed': return '#0ea5e9';
      case 'planned': return '#d97706';
      default: return '#64748b';
    }
  }};

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 2px 4px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  text-align: center;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;

  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin-bottom: 8px;
  color: #64748b;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #cbd5e1;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const WellList = ({ wells, selectedWell, onWellSelect, wellUploadedData = {} }) => {
  return (
    <WellListContainer>
      <WellListHeader>
        <WellListTitle>Well List</WellListTitle>
      </WellListHeader>
      <WellListContent>
        {wells.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🏭</EmptyIcon>
            <EmptyText>No wells available</EmptyText>
            <EmptySubtext>Please add a new well to get started.</EmptySubtext>
          </EmptyState>
        ) : (
          wells.map((well) => {
            const hasUploadedData = wellUploadedData[well.id] && wellUploadedData[well.id].length > 0;
            return (
              <WellItem
                key={well.id}
                selected={selectedWell?.id === well.id}
                onClick={() => onWellSelect(well)}
              >
                <WellName selected={selectedWell?.id === well.id}>
                  <UploadIndicator hasData={hasUploadedData} />
                  {well.name}
                </WellName>
                <WellDetails>
                  <WellDepth>Depth: {well.depth.toLocaleString()} ft</WellDepth>
                  {/* <WellStatus >{well.status}</WellStatus> */}
                </WellDetails>
              </WellItem>
            );
          })
        )}
      </WellListContent>
    </WellListContainer>
  );
};

export default WellList; 