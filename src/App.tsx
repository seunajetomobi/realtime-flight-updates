import { useState } from "react";
import AirportDetail from "./AirportDetail";

type Airport = { code: string; name: string; lat: number; lon: number };

// Complete list of Swedish airports
const airportsData: Airport[] = [
  {
    code: "ARN",
    name: "Stockholm Arlanda Airport",
    lat: 59.6519,
    lon: 17.9186,
  },
  {
    code: "GOT",
    name: "Göteborg Landvetter Airport",
    lat: 57.6686,
    lon: 12.2798,
  },
  { code: "BMA", name: "Bromma Stockholm Airport", lat: 59.3543, lon: 17.9396 },
  { code: "MMX", name: "Malmö Airport", lat: 55.5256, lon: 13.3723 },
  { code: "LLA", name: "Luleå Airport", lat: 65.5408, lon: 22.1308 },
  { code: "UME", name: "Umeå Airport", lat: 64.2806, lon: 20.9384 },
  { code: "ORB", name: "Åre Ostersund Airport", lat: 63.1934, lon: 14.5017 },
  { code: "VIS", name: "Visby Airport", lat: 57.6676, lon: 18.4433 },
  { code: "RNB", name: "Ronneby Airport", lat: 56.1197, lon: 15.2783 },
  { code: "KIR", name: "Kiruna Airport", lat: 67.8209, lon: 20.3426 },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleAirportSelect = (code: string) => {
    setSelected(code);
    setSidebarOpen(false);
  };

  // Get selected airport data
  const selectedAirport = selected
    ? airportsData.find((a) => a.code === selected)
    : null;

  // Show detail page if airport is selected
  if (selectedAirport) {
    return (
      <AirportDetail
        airport={selectedAirport}
        onBack={() => setSelected(null)}
      />
    );
  }

  // Show homepage
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Main Content Area */}
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{
          background:
            "linear-gradient(to bottom, #FFFACD 0%, #FFE680 20%, #FFD700 40%, #FFA500 60%, #FF8C00 80%, #FF6347 100%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "28px" }}>✈️</span>
            <span>Svairtrafiko</span>
          </div>
        </div>

        {/* Language selector */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            color: "black",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          About Us
        </div>

        {/* Main Content Sections */}
        <div
          style={{
            display: "flex",
            gap: "60px",
            maxWidth: "900px",
            alignItems: "center",
          }}
        >
          {/* Left Section - Select Airport */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                backgroundColor: "white",
                color: "#1f2937",
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Select airport
            </button>
            <div
              style={{ color: "black", fontSize: "14px", lineHeight: "1.6" }}
            >
              <p>
                Departures, arrivals, parking, shopping and everything else you
                need to know about before you travel.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "150px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />

          {/* Right Section - About Swedavia */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
            }}
          >
            <button
              style={{
                backgroundColor: "white",
                color: "#1f2937",
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              International flights
            </button>
            <div
              style={{ color: "black", fontSize: "14px", lineHeight: "1.6" }}
            >
              <p>
                Aviation business, real estate, advertising, financial
                information, press and news.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Airport List */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "320px",
          height: "100vh",
          background:
            "linear-gradient(to bottom, #FFFACD 0%, #FFE680 20%, #FFD700 40%, #FFA500 60%, #FF8C00 80%, #FF6347 100%)",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "2px solid #059669",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FBBF24",
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#78350F" }}
          >
            Svairtrafiko
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#78350F",
            }}
          >
            ✕
          </button>
        </div>

        {/* Airports List */}
        <div style={{ padding: "0" }}>
          {airportsData.map((airport) => (
            <button
              key={airport.code}
              onClick={() => handleAirportSelect(airport.code)}
              style={{
                width: "100%",
                padding: "16px 20px",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid #059669",
                backgroundColor:
                  selected === airport.code ? "#047857" : "#10B981",
                color: selected === airport.code ? "#ECFDF5" : "#F0FDFA",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: selected === airport.code ? "600" : "400",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  selected === airport.code ? "#047857" : "#10B981";
              }}
            >
              <div>
                <span style={{ fontWeight: "600", marginRight: "8px" }}>
                  {airport.code}
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: selected === airport.code ? "#ECFDF5" : "#D1FAE5",
                  marginTop: "4px",
                }}
              >
                {airport.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "calc(100% - 320px)",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}

export default App;
