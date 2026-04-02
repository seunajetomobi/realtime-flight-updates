import React, { useEffect, useState } from "react";

type Airport = { code: string; name: string; lat: number; lon: number };
type FlightStatus =
  | "Cancelled"
  | "Delayed"
  | "Gate closed"
  | "Boarding"
  | "On time"
  | "Arrives"
  | "Arrived"
  | "Departed";

interface BroadcastFlight {
  id: string;
  callsign: string;
  flight: string;
  airline: string;
  origin: string;
  dest: string;
  lat: number;
  lon: number;
  departure_time: string;
  arrival_time: string;
}

interface Flight {
  id: string;
  time: string;
  destination?: string;
  origin?: string;
  flightNo: string;
  airline: string;
  terminal: string;
  status: FlightStatus;
  departureTime?: string;
  arrivalTime?: string;
  type: "departure" | "arrival";
  checkInDesk: string;
  securityWaitTime: string;
}

interface AirportDetailProps {
  airport: Airport;
  onBack: () => void;
}

const AirportDetail: React.FC<AirportDetailProps> = ({ airport, onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    "welcome" | "departures" | "arrivals"
  >("welcome");
  const [departureFlights, setDepartureFlights] = useState<Flight[]>([]);
  const [arrivalFlights, setArrivalFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showFlightDetail, setShowFlightDetail] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Mock flight data for when WebSocket isn't available
  const getMockFlights = (): BroadcastFlight[] => {
    const now = new Date();
    const mockFlights: BroadcastFlight[] = [];
    for (let i = 0; i < 18; i++) {
      const depTime = new Date(now.getTime() + (i + 1) * 45 * 60 * 1000);
      const arrTime = new Date(depTime.getTime() + 2 * 60 * 60 * 1000);
      mockFlights.push({
        id: `mock-${i}`,
        callsign: `SK${800 + i}`,
        flight: `SAS${i + 100}`,
        airline: i % 2 === 0 ? "SAS" : "Ryanair",
        origin: airport.code,
        dest: i % 2 === 0 ? "ARN" : "GOT",
        lat: 0,
        lon: 0,
        departure_time: depTime.toISOString(),
        arrival_time: arrTime.toISOString(),
      });
    }
    return mockFlights;
  };

  useEffect(() => {
    // Only try WebSocket on localhost
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      // Use mock data for GitHub Pages
      const mockFlights = getMockFlights();
      const deps = mockFlights
        .slice(0, Math.ceil(mockFlights.length / 2))
        .map((f) => convertToFlight(f, "departure"))
        .sort((a, b) => a.time.localeCompare(b.time));

      const arrs = mockFlights
        .slice(Math.ceil(mockFlights.length / 2))
        .map((f) => convertToFlight(f, "arrival"))
        .sort((a, b) => a.time.localeCompare(b.time));

      setDepartureFlights(deps);
      setArrivalFlights(arrs);
      setIsConnected(true);
      return;
    }

    const wsUrl = `ws://${window.location.hostname}:8080`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to flight broadcaster");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "flights" && data.flights) {
          const flights = data.flights as BroadcastFlight[];
          console.log(
            "Received flights:",
            flights.length,
            "Airport:",
            airport.code,
          );

          // Show ALL flights - roughly split into departures and arrivals
          const deps = flights
            .slice(0, Math.ceil(flights.length / 2))
            .map((f) => convertToFlight(f, "departure"))
            .sort((a, b) => a.time.localeCompare(b.time));

          const arrs = flights
            .slice(Math.ceil(flights.length / 2))
            .map((f) => convertToFlight(f, "arrival"))
            .sort((a, b) => a.time.localeCompare(b.time));

          console.log("Departures:", deps.length, "Arrivals:", arrs.length);
          setDepartureFlights(deps);
          setArrivalFlights(arrs);
        }
      } catch (err) {
        console.error("Error processing flight data:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("Disconnected from flight broadcaster");
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [airport.code]);

  const convertToFlight = (
    bf: BroadcastFlight,
    type: "departure" | "arrival",
  ): Flight => {
    const timeStr = type === "departure" ? bf.departure_time : bf.arrival_time;
    const date = new Date(timeStr);
    const time = date.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Determine status based on time
    const now = new Date();
    let status: FlightStatus = "On time";

    if (type === "departure") {
      if (date < now) {
        status = "Departed";
      } else if (date.getTime() - now.getTime() < 30 * 60 * 1000) {
        status = "Boarding";
      }
    } else {
      if (date < now) {
        status = "Arrived";
      }
    }

    return {
      id: bf.id,
      time,
      destination: type === "departure" ? bf.dest : undefined,
      origin: type === "arrival" ? bf.origin : undefined,
      flightNo: bf.callsign,
      airline: bf.airline,
      terminal: String(Math.floor(Math.random() * 4) + 2),
      status,
      departureTime: bf.departure_time,
      arrivalTime: bf.arrival_time,
      type,
      checkInDesk: [
        "Self Check-in kiosk",
        "Counter A",
        "Counter B",
        "Self Service",
      ].sort(() => Math.random() - 0.5)[0],
      securityWaitTime: ["5-10 min", "10-15 min", "0-5 min", "15-20 min"].sort(
        () => Math.random() - 0.5,
      )[0],
    };
  };

  const getStatusColor = (status: FlightStatus): string => {
    switch (status) {
      case "Cancelled":
        return "#dc2626";
      case "Delayed":
        return "#dc2626";
      case "Gate closed":
        return "#dc2626";
      case "Boarding":
        return "#16a34a";
      case "On time":
        return "#1e40af";
      case "Arrives":
        return "#1e40af";
      case "Arrived":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getTerminalWaitTimes = (code: string) => {
    // Sample data - in a real app this would come from an API
    const waitTimes: Record<string, { terminal: string; time: string }[]> = {
      ARN: [
        { terminal: "Terminal 2", time: "0-5 min" },
        { terminal: "Terminal 3", time: "0-1 min" },
        { terminal: "Terminal 5", time: "5-10 min" },
      ],
      GOT: [{ terminal: "Terminal", time: "2-5 min" }],
    };
    return waitTimes[code] || [{ terminal: "Terminal 1", time: "5-10 min" }];
  };

  const services = [
    {
      icon: "✈️",
      title: "Departures",
      description: "Check your flight status",
    },
    { icon: "✈️", title: "Arrivals", description: "Track arriving flights" },
    {
      icon: "🅿️",
      title: "Parking",
      description: "Pre-book Easter parking indoor fr SEK 119/day",
    },
    {
      icon: "ℹ️",
      title: "For those arriving at Arlanda",
      description: "Transportation, baggage, lost & found, hotels, etc.",
    },
    { icon: "🛍️", title: "Shopping", description: "Current opening hours" },
    {
      icon: "❓",
      title: "Frequently asked questions",
      description: "Find answers here",
    },
    {
      icon: "🍽️",
      title: "Food & beverages",
      description: "Current opening hours",
    },
    { icon: "🗺️", title: "Airport maps", description: "Navigate the airport" },
    {
      icon: "🚗",
      title: "Book a trip to and from the airport",
      description: "Convenient transportation",
    },
    {
      icon: "♻️",
      title: "Buy biofuel for your flight",
      description: "Reduce the carbon dioxide emissions",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%271200%27 height=%27800%27%3E%3Cdefs%3E%3ClinearGradient id=%27bg%27 x1=%270%25%27 y1=%270%25%27 x2=%27100%25%27 y2=%27100%25%27%3E%3Cstop offset=%270%25%27 style=%27stop-color:%23166534;stop-opacity:1%27 /%3E%3Cstop offset=%27100%25%27 style=%27stop-color:%23065f46;stop-opacity:1%27 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%271200%27 height=%27800%27 fill=%27url(%23bg)%27/%3E%3C/svg%3E")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#FEF08A",
          borderBottom: "2px solid #CA8A04",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#78350F",
              padding: "8px",
            }}
          >
            ←
          </button>
          <div>
            <div
              style={{ fontSize: "14px", fontWeight: "bold", color: "#78350F" }}
            >
              ✈️ Svairtrafiko
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <input
            type="text"
            placeholder="Search e.g. departure..."
            style={{
              padding: "8px 16px",
              border: "1px solid #CA8A04",
              borderRadius: "4px",
              width: "200px",
              fontSize: "13px",
            }}
          />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#78350F",
            }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 32px" }}
      >
        {currentView === "welcome" && (
          <>
            {/* Welcome Section */}
            <div style={{ marginBottom: "48px" }}>
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "32px",
                  lineHeight: "1.2",
                }}
              >
                Welcome to
                <br />
                {airport.name}
              </h1>

              <div
                style={{
                  borderBottom: "2px solid white",
                  paddingBottom: "32px",
                  marginBottom: "32px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "white",
                    marginBottom: "16px",
                  }}
                >
                  When should I be at the airport?
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="date"
                    style={{
                      padding: "10px 16px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "4px",
                      fontSize: "13px",
                      cursor: "pointer",
                      backgroundColor: "white",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="I am flying to ..."
                    style={{
                      padding: "10px 16px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "4px",
                      flex: 1,
                      fontSize: "13px",
                      backgroundColor: "white",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.8)",
                      fontStyle: "italic",
                    }}
                  >
                    Find your flight for a recommended time
                  </div>
                </div>
              </div>

              {/* Waiting Times */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "6px",
                  padding: "24px",
                  marginBottom: "32px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "white",
                    marginBottom: "16px",
                  }}
                >
                  🔒 Waiting time in Security
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {getTerminalWaitTimes(airport.code).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "white",
                        }}
                      >
                        {item.terminal}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#4ade80",
                        }}
                      >
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              {services.map((service, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (service.title === "Departures") {
                      setCurrentView("departures");
                    } else if (service.title === "Arrivals") {
                      setCurrentView("arrivals");
                    }
                  }}
                  style={{
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    paddingBottom: "16px",
                    cursor:
                      service.title === "Departures" ||
                      service.title === "Arrivals"
                        ? "pointer"
                        : "default",
                    transition: "all 0.3s ease",
                    backgroundColor:
                      service.title === "Departures" ||
                      service.title === "Arrivals"
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                    padding: "16px",
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      service.title === "Departures" ||
                      service.title === "Arrivals"
                    ) {
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.borderBottomColor = "#4ade80";
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLDivElement
                    ).style.borderBottomColor = "rgba(255,255,255,0.3)";
                    if (
                      service.title === "Departures" ||
                      service.title === "Arrivals"
                    ) {
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "rgba(255,255,255,0.05)";
                    } else {
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>{service.icon}</span>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.8)",
                      marginLeft: "36px",
                    }}
                  >
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {currentView === "departures" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  Departures
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                  {airport.name}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FEF08A",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                border: "2px solid #CA8A04",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#FBBF24",
                      borderBottom: "3px solid #CA8A04",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Destination
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Flight No.
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Airline
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Terminal
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Check-in
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departureFlights.map((flight, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowFlightDetail(true);
                      }}
                      style={{
                        borderBottom: "1px solid #CA8A04",
                        backgroundColor: idx % 2 === 0 ? "#FEF3C7" : "#FEFCE8",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor = "#FCD34D";
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor =
                          idx % 2 === 0 ? "#FEF3C7" : "#FEFCE8";
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.boxShadow = "none";
                      }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        {flight.time}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.destination}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.flightNo}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.airline}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.terminal}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.checkInDesk}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: getStatusColor(flight.status),
                        }}
                      >
                        {flight.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === "arrivals" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  Arrivals
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                  {airport.name}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FEF08A",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                border: "2px solid #CA8A04",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#FBBF24",
                      borderBottom: "3px solid #CA8A04",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Origin
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Flight No.
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Airline
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Terminal
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Check-in
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#78350F",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {arrivalFlights.map((flight, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowFlightDetail(true);
                      }}
                      style={{
                        borderBottom: "1px solid #CA8A04",
                        backgroundColor: idx % 2 === 0 ? "#FEF3C7" : "#FEFCE8",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor = "#FCD34D";
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.backgroundColor =
                          idx % 2 === 0 ? "#FEF3C7" : "#FEFCE8";
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.boxShadow = "none";
                      }}
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f172a",
                        }}
                      >
                        {flight.time}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.origin}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.flightNo}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.airline}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.terminal}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {flight.checkInDesk}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: getStatusColor(flight.status),
                        }}
                      >
                        {flight.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Right-side Menu Dropdown */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "280px",
          height: "100vh",
          backgroundColor: "#FEF08A",
          boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
          border: "1px solid #CA8A04",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        {/* Menu Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "2px solid #CA8A04",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FBBF24",
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#78350F" }}
          >
            Menu
          </div>
          <button
            onClick={() => setMenuOpen(false)}
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

        {/* Menu Items */}
        <div style={{ padding: "0" }}>
          <button
            onClick={() => {
              setCurrentView("welcome");
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid #CA8A04",
              backgroundColor: "#FEFCE8",
              color: "#78350F",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3C7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEFCE8";
            }}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView("departures");
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid #CA8A04",
              backgroundColor: "#FEFCE8",
              color: "#78350F",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3C7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEFCE8";
            }}
          >
            Departures
          </button>
          <button
            onClick={() => {
              setCurrentView("arrivals");
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid #CA8A04",
              backgroundColor: "#FEFCE8",
              color: "#78350F",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3C7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEFCE8";
            }}
          >
            Arrivals
          </button>
          <button
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid #CA8A04",
              backgroundColor: "#FEFCE8",
              color: "#78350F",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3C7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEFCE8";
            }}
          >
            Contact
          </button>
          <button
            style={{
              width: "100%",
              padding: "16px 20px",
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid #CA8A04",
              backgroundColor: "#FEFCE8",
              color: "#78350F",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3C7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEFCE8";
            }}
          >
            About
          </button>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Flight Detail Modal */}
      {showFlightDetail && selectedFlight && (
        <>
          <div
            onClick={() => setShowFlightDetail(false)}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              zIndex: 1100,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FEF08A",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "2px solid #CA8A04",
              zIndex: 1101,
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "24px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                >
                  {selectedFlight.type === "departure"
                    ? selectedFlight.destination
                    : selectedFlight.origin}
                </h1>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  <span>Flight: {selectedFlight.flightNo}</span>
                  <span>•</span>
                  <span>{selectedFlight.airline}</span>
                </div>
              </div>
              <button
                onClick={() => setShowFlightDetail(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Time
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {selectedFlight.time}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: getStatusColor(selectedFlight.status),
                  }}
                >
                  {selectedFlight.status}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Terminal
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#0f172a",
                  }}
                >
                  {selectedFlight.terminal}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Check-in
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#065f46",
                  }}
                >
                  {selectedFlight.checkInDesk}
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "2px solid #e5e7eb",
                paddingTop: "24px",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginBottom: "16px",
                }}
              >
                Flight Timeline
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                <div
                  style={{ textAlign: "center", flex: 1, position: "relative" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#065f46",
                      margin: "20px auto 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    1
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Check-in
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    2 hours before
                  </div>
                </div>
                {[2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: "2px",
                        backgroundColor: "#e5e7eb",
                        marginBottom: "8px",
                        marginTop: "20px",
                        position: "absolute",
                        left: "-50%",
                        top: "20px",
                        width: "100%",
                      }}
                    />
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#d1d5db",
                        margin: "20px auto 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "18px",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {step}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      {step === 2
                        ? "Security"
                        : step === 3
                          ? "Boarding"
                          : "Departure"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {step === 2
                        ? "30-45 min"
                        : step === 3
                          ? "45 min"
                          : selectedFlight.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f172a",
                  marginBottom: "16px",
                }}
              >
                Information for{" "}
                {selectedFlight.type === "departure"
                  ? "departures"
                  : "arrivals"}
              </h3>
              <div
                style={{
                  fontSize: "13px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                }}
              >
                {selectedFlight.type === "departure" ? (
                  <>
                    <p>
                      ✓ We recommend you be at the airport at{" "}
                      <strong>06:05</strong>
                    </p>
                    <p>
                      Passengers are always responsible for checking what the
                      airline requires. Right through airline and for keeping
                      updated.
                    </p>
                    <p>
                      The given time is an estimate.{" "}
                      <a
                        href="#"
                        style={{
                          color: "#065f46",
                          textDecoration: "underline",
                        }}
                      >
                        Read about rules we set for airlines.
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      ✓ Flight is expected to arrive at approximately{" "}
                      <strong>{selectedFlight.time}</strong>
                    </p>
                    <p>
                      After landing, passengers will proceed through baggage
                      claim and customs if applicable.
                    </p>
                    <p>
                      For passengers picking up others, terminal exits and
                      pick-up zones are clearly marked.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AirportDetail;
