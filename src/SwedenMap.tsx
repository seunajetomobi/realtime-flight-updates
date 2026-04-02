type Airport = { code: string; name: string; lat: number; lon: number };

interface SwedenMapProps {
  airports: Airport[];
  selectedAirport: string;
  onAirportSelect: (code: string) => void;
  darkMode: boolean;
}

export default function SwedenMap({
  airports,
  selectedAirport,
  onAirportSelect,
  darkMode,
}: SwedenMapProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: darkMode ? "#374151" : "#ffffff",
        color: darkMode ? "#ffffff" : "#1f2937",
        padding: "16px",
      }}
    >
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        Sweden Map
      </h2>
      <div style={{ marginBottom: "16px" }}>
        <p>Airports loaded: {airports.length}</p>
        <p>Selected: {selectedAirport}</p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        {airports.slice(0, 6).map((airport) => (
          <button
            key={airport.code}
            onClick={() => onAirportSelect(airport.code)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              backgroundColor:
                selectedAirport === airport.code
                  ? "#3b82f6"
                  : darkMode
                    ? "#4b5563"
                    : "#f3f4f6",
              color:
                selectedAirport === airport.code
                  ? "#ffffff"
                  : darkMode
                    ? "#e5e7eb"
                    : "#1f2937",
            }}
          >
            {airport.code} - {airport.name}
          </button>
        ))}
      </div>
    </div>
  );
}
