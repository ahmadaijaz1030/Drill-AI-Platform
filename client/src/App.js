import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUpload, FiFilter, FiZoomIn, FiZoomOut, FiChevronLeft, FiMessageCircle } from 'react-icons/fi';
import { GiDrill } from 'react-icons/gi';
import WellList from './components/WellList';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import FileUpload from './components/FileUpload';
import { Toaster, toast } from 'react-hot-toast';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(-100%);
    z-index: 1000;
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: 1024px) {
    padding: 12px 16px;
    padding-top: 80px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    padding-top: 80px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    padding-top: 70px;
    gap: 12px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
    gap: 8px;
    justify-content: center;
    text-align: center;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 8px;
    justify-content: center;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 6px;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const ControlButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  @media (max-width: 1024px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
    min-width: 0;
    flex: 1;
    justify-content: center;
    max-width: 120px;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
    min-width: 0;
    flex: 1;
    justify-content: center;
    max-width: 120px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 12px;
    gap: 3px;
    max-width: 100px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const DashboardArea = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;

  @media (max-width: 1024px) {
    width: 100%;
    height: 100%;
  }
`;

const ChatArea = styled.div`
  width: 320px;
  background: white;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 320px;
    transform: translateX(100%);
    z-index: 1000;
    transition: transform 0.3s ease;
    border-left: none;
    border-right: 1px solid #e2e8f0;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: scale(1.05);
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
    top: 15px;
    left: 15px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    top: 15px;
    left: 15px;
  }

  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    top: 12px;
    left: 12px;
  }
`;

const ChatToggle = styled.button`
  display: none;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: scale(1.05);
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
    top: 15px;
    right: 15px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    top: 15px;
    right: 15px;
  }

  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    top: 12px;
    right: 12px;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 1024px) {
    display: ${props => props.show ? 'block' : 'none'};
  }
`;

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;

  @media (max-width: 1024px) {
    gap: 6px;
    padding: 3px 6px;
  }

  @media (max-width: 768px) {
    gap: 6px;
    padding: 3px 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    padding: 2px 4px;
  }
`;

const ZoomButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  @media (max-width: 1024px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 480px) {
    width: 22px;
    height: 22px;
  }
`;

const ZoomLevel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  min-width: 40px;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 13px;
    min-width: 35px;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    min-width: 35px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    min-width: 30px;
  }
`;

function App() {
  const [selectedWell, setSelectedWell] = useState(null);
  const [wellData, setWellData] = useState([
    { id: 1, name: 'Well A', depth: 5000, location: 'Gulf of Mexico', status: 'active' },
    { id: 2, name: 'Well AA', depth: 4500, location: 'North Sea', status: 'active' },
    { id: 3, name: 'Well AAA', depth: 5200, location: 'Permian Basin', status: 'active' },
    { id: 4, name: 'Well B', depth: 4800, location: 'Eagle Ford', status: 'active' },
    { id: 5, name: 'Well C', depth: 5500, location: 'Bakken', status: 'completed' },
    { id: 6, name: 'Well D', depth: 4200, location: 'Marcellus Shale', status: 'planned' },
    { id: 7, name: 'Well E', depth: 5800, location: 'Haynesville Shale', status: 'active' },
    { id: 8, name: 'Well F', depth: 3900, location: 'Barnett Shale', status: 'completed' }
  ]);
  const [wellUploadedData, setWellUploadedData] = useState({}); // Store data per well
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('drilling');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and adjust sidebar state accordingly
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile/tablet
      } else {
        setSidebarOpen(true); // Open sidebar on desktop
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWellSelect = (well) => {
    setSelectedWell(well);
    // Only close sidebar on mobile/tablet when well is selected
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleFileUpload = (data) => {
    if (!selectedWell) {
      toast.error('Please select a well first before uploading data');
      setShowUpload(false);
      return;
    }

    // Store data for the selected well
    setWellUploadedData(prev => ({
      ...prev,
      [selectedWell.id]: data
    }));
    
    toast.success(`Uploaded ${data.length} records to ${selectedWell.name}!`);
    setShowUpload(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setChatOpen(false); // Close chat when opening sidebar
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    setSidebarOpen(false); // Close sidebar when opening chat
  };

  const closeSidebars = () => {
    setSidebarOpen(false);
    setChatOpen(false);
  };

  const closeTab = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab('drilling');
    }
  };

  // Get uploaded data for the currently selected well
  const getCurrentWellData = () => {
    if (!selectedWell) return [];
    return wellUploadedData[selectedWell.id] || [];
  };

  return (
    <AppContainer>
      <MobileToggle onClick={toggleSidebar}>
        <FiChevronLeft />
      </MobileToggle>

      <ChatToggle onClick={toggleChat}>
        <FiMessageCircle />
      </ChatToggle>

      <Overlay show={sidebarOpen || chatOpen} onClick={closeSidebars} />

      <Sidebar
        className={sidebarOpen ? 'open' : ''}
      >
        <WellList 
          wells={wellData}
          selectedWell={selectedWell}
          onWellSelect={handleWellSelect}
          wellUploadedData={wellUploadedData}
        />
      </Sidebar>

      <MainContent>
        <Header>
          <Title>
            <GiDrill size={28} color="#3b82f6" />
            Drill AI Intelligence Platform
          </Title>
          
          <Controls>
            <ControlButton 
              onClick={() => {
                if (!selectedWell) {
                  toast.error('Please select a well first before uploading data');
                  return;
                }
                setShowUpload(true);
              }}
            >
              <FiUpload />
              Upload
            </ControlButton>
            <ControlButton>
              <FiFilter />
              Filter
            </ControlButton>
            <ZoomControl>
              <ZoomButton onClick={handleZoomOut}>
                <FiZoomOut />
              </ZoomButton>
              <ZoomLevel>{Math.round(zoomLevel * 100)}%</ZoomLevel>
              <ZoomButton onClick={handleZoomIn}>
                <FiZoomIn />
              </ZoomButton>
            </ZoomControl>
          </Controls>
        </Header>

        <ContentArea>
          <DashboardArea>
            <Dashboard
              selectedWell={selectedWell}
              uploadedData={getCurrentWellData()}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              closeTab={closeTab}
              zoomLevel={zoomLevel}
            />
          </DashboardArea>

          <ChatArea className={chatOpen ? 'open' : ''}>
            <Chatbot selectedWell={selectedWell} uploadedData={getCurrentWellData()} />
          </ChatArea>
        </ContentArea>
      </MainContent>

      {showUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      <Toaster
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppContainer>
  );
}

export default App; 