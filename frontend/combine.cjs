const fs = require('fs');

const logic = fs.readFileSync('dashboard_logic.txt', 'utf8');
const jsx = fs.readFileSync('dashboard_jsx.txt', 'utf8');

let newTopPart = logic;
if (!newTopPart.includes('import CommandPalette')) {
  newTopPart = newTopPart.replace(
    'import PricingModal from "../components/PricingModal";',
    'import PricingModal from "../components/PricingModal";\nimport CommandPalette from "../components/CommandPalette";'
  );
}
if (!newTopPart.includes('Search,')) {
  newTopPart = newTopPart.replace(
    'import {',
    'import {\n  Search,'
  );
}

const stateToAdd = `
  const [cmdKOpen, setCmdKOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdKOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandSelect = (id) => {
    if (id === "home") navigate("/");
    else if (id === "settings") setShowSettingsModal(true);
    else if (id === "plans") { setActiveNav("plans"); setShowPricingModal(true); }
    else setActiveNav(id);
  };
`;

const navSelectIdx = newTopPart.lastIndexOf('const handleNavSelect = (id) => {');
const handleNavSelectEnd = newTopPart.indexOf('};', navSelectIdx) + 2;
newTopPart = newTopPart.substring(0, handleNavSelectEnd) + '\n' + stateToAdd + '\n' + newTopPart.substring(handleNavSelectEnd);

fs.writeFileSync('src/pages/Dashboard.jsx', newTopPart + jsx);
console.log('Dashboard replaced successfully!');
