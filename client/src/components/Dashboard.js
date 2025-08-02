import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar 
} from 'recharts';

const DashboardContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const TabContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 20px;
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const Tab = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? '#1e40af' : '#64748b'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 14px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    color: ${props => props.active ? '#1e40af' : '#475569'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
  }
`;

const TabCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e2e8f0;
    color: #64748b;
  }

  @media (max-width: 480px) {
    padding: 1px;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 16px;
  }
`;

const ChartSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 400px;
  min-height: 400px;

  @media (max-width: 768px) {
    padding: 16px;
    height: 350px;
    min-height: 350px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    height: 300px;
    min-height: 300px;
  }
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 8px;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 12px;
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
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;

  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 40px;
    margin-bottom: 8px;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin-bottom: 8px;

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

const DataTable = styled.div`
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  min-height: 410px;
  max-height: 410px;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-top: 16px;
    min-height: 400px;
    max-height: 400px;
  }

  @media (max-width: 480px) {
    margin-top: 12px;
    min-height: 400px;
    max-height: 400px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background: #f8fafc;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 12px;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    padding: 8px 12px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 50px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    padding: 6px 8px;
    font-size: 10px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 8px 16px;
  font-size: 12px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    padding: 6px 12px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 50px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    padding: 4px 8px;
    font-size: 10px;
  }
`;

const TableCell = styled.div`
  color: #475569;
  font-weight: ${props => props.header ? '600' : '400'};
`;

const DataInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    margin-bottom: 12px;
    gap: 8px;
  }
`;

const DataInfoItem = styled.div`
  text-align: center;

  @media (max-width: 768px) {
    flex: 1;
    min-width: 80px;
  }
`;

const DataInfoLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 11px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const DataInfoValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #0ea5e9;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;



const Dashboard = ({ 
  selectedWell, 
  uploadedData, 
  activeTab, 
  setActiveTab, 
  closeTab, 
  zoomLevel 
}) => {
  // Use useMemo to prevent unnecessary re-renders and data processing
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) {
      return [];
    }

    const processed = uploadedData.map(item => ({
      depth: parseFloat(item.depth) || 0,
      sh: parseFloat(item.sh) * 100 || 0,
      ss: parseFloat(item.ss) * 100 || 0,
      ls: parseFloat(item.ls) * 100 || 0,
      dol: parseFloat(item.dol) * 100 || 0,
      anh: parseFloat(item.anh) * 100 || 0,
      coal: parseFloat(item.coal) * 100 || 0,
      salt: parseFloat(item.salt) * 100 || 0,
      dt: parseFloat(item.dt) || 0,
      gr: parseFloat(item.gr) || 0,
      minfinal: parseFloat(item.minfinal) || 0,
      ucs: parseFloat(item.ucs) || 0,
      fa: parseFloat(item.fa) || 0,
      rat: parseFloat(item.rat) || 0,
      rop: parseFloat(item.rop) || 0
    }));

    return processed;
  }, [uploadedData]);

  // Calculate data statistics
  const dataStats = useMemo(() => {
    if (processedData.length === 0) return null;

    const depths = processedData.map(d => d.depth);
    const dts = processedData.map(d => d.dt);
    const grs = processedData.map(d => d.gr);

    return {
      totalRecords: processedData.length,
      depthRange: `${Math.min(...depths).toFixed(1)} - ${Math.max(...depths).toFixed(1)}`,
      avgDT: (dts.reduce((a, b) => a + b, 0) / dts.length).toFixed(1),
      avgGR: (grs.reduce((a, b) => a + b, 0) / grs.length).toFixed(1)
    };
  }, [processedData]);

  const tabs = [
    { id: 'drilling', name: 'Drilling Monitoring', closable: false },
    { id: 'offset', name: 'Offset Wells Map', closable: true },
    { id: 'bit', name: 'Bit Summary', closable: true }
  ];

  const renderDrillingCharts = () => (
    <>
      <ChartGrid>
        <ChartSection>
          <ChartTitle>Rock Composition</ChartTitle>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                  labelFormatter={(label) => `Depth: ${label}`}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                            Depth: {label}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            SH: {data.sh.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            SS: {data.ss.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            LS: {data.ls.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            DOL: {data.dol.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            ANH: {data.anh.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            Coal: {data.coal.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            Salt: {data.salt.toFixed(2)}%
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            DT: {data.dt.toFixed(3)}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            GR: {data.gr.toFixed(3)}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            MINFINAL: {data.minfinal}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            UCS: {data.ucs.toFixed(4)}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            FA: {data.fa.toFixed(4)}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            RAT: {data.rat}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '12px' }}>
                            ROP: {data.rop.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="sh" stackId="a" fill="#ec4899" name="SH" />
                <Bar dataKey="ss" stackId="a" fill="#f97316" name="SS" />
                <Bar dataKey="ls" stackId="a" fill="#06b6d4" name="LS" />
                <Bar dataKey="dol" stackId="a" fill="#84cc16" name="DOL" />
                <Bar dataKey="anh" stackId="a" fill="#3b82f6" name="ANH" />
                <Bar dataKey="coal" stackId="a" fill="#fbbf24" name="Coal" />
                <Bar dataKey="salt" stackId="a" fill="#9ca3af" name="Salt" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>

        <ChartSection>
          <ChartTitle>DT (Delta T)</ChartTitle>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value.toFixed(2), 'DT']}
                  labelFormatter={(label) => `Depth: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="dt" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>

        <ChartSection>
          <ChartTitle>GR (Gamma Ray)</ChartTitle>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value.toFixed(2), 'GR']}
                  labelFormatter={(label) => `Depth: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="gr" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>
      </ChartGrid>
    </>
  );

  const renderDataTable = () => (
    <DataTable>
      <TableHeader>
        <TableCell header>Depth</TableCell>
        <TableCell header>%SH</TableCell>
        <TableCell header>%SS</TableCell>
        <TableCell header>%LS</TableCell>
        <TableCell header>%DOL</TableCell>
        <TableCell header>%ANH</TableCell>
        <TableCell header>%Coal</TableCell>
        <TableCell header>%Salt</TableCell>
        <TableCell header>DT</TableCell>
        <TableCell header>GR</TableCell>
        <TableCell header>MINFINAL</TableCell>
        <TableCell header>UCS</TableCell>
        <TableCell header>FA</TableCell>
        <TableCell header>RAT</TableCell>
        <TableCell header>ROP</TableCell>
      </TableHeader>
      {processedData.map((row, index) => (
        <TableRow key={index}>
          <TableCell>{row.depth.toFixed(1)}</TableCell>
          <TableCell>{row.sh.toFixed(2)}</TableCell>
          <TableCell>{row.ss.toFixed(2)}</TableCell>
          <TableCell>{row.ls.toFixed(2)}</TableCell>
          <TableCell>{row.dol.toFixed(2)}</TableCell>
          <TableCell>{row.anh.toFixed(2)}</TableCell>
          <TableCell>{row.coal.toFixed(2)}</TableCell>
          <TableCell>{row.salt.toFixed(2)}</TableCell>
          <TableCell>{row.dt.toFixed(2)}</TableCell>
          <TableCell>{row.gr.toFixed(2)}</TableCell>
          <TableCell>{row.minfinal}</TableCell>
          <TableCell>{row.ucs.toFixed(4)}</TableCell>
          <TableCell>{row.fa.toFixed(4)}</TableCell>
          <TableCell>{row.rat}</TableCell>
          <TableCell>{row.rop.toFixed(2)}</TableCell>
        </TableRow>
      ))}
    </DataTable>
  );

  const renderEmptyState = () => (
    <EmptyState>
      <EmptyIcon>📊</EmptyIcon>
      <EmptyText>No data available</EmptyText>
      <EmptySubtext>Upload well data to see charts and analysis</EmptySubtext>
    </EmptyState>
  );

  return (
    <DashboardContainer>
      <TabContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
            {tab.closable && (
              <TabCloseButton onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}>
                <FiX size={12} />
              </TabCloseButton>
            )}
          </Tab>
        ))}
      </TabContainer>

      <ChartContainer style={{ transform: `scale(${zoomLevel})` }}>
        {activeTab === 'drilling' && (
          <>
            {processedData.length > 0 ? (
              <>
                {renderDrillingCharts()}
                {renderDataTable()}
              </>
            ) : (
              renderEmptyState()
            )}
          </>
        )}

        {activeTab === 'offset' && (
          <EmptyState>
            <EmptyIcon>🗺️</EmptyIcon>
            <EmptyText>Offset Wells Map</EmptyText>
            <EmptySubtext>Interactive map view coming soon</EmptySubtext>
          </EmptyState>
        )}

        {activeTab === 'bit' && (
          <EmptyState>
            <EmptyIcon>🔧</EmptyIcon>
            <EmptyText>Bit Summary</EmptyText>
            <EmptySubtext>Drill bit analysis and recommendations</EmptySubtext>
          </EmptyState>
        )}
      </ChartContainer>
    </DashboardContainer>
  );
};

export default Dashboard; 