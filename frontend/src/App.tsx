// import Login from './components/pages/Login'

// function App() {
//   return (
//     <>
//       <Login></Login>
//     </>
//   )
// }

// export default App


// import { TooltipProvider } from "../src/components/ui/tooltip";  // Make sure this import is correct
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "../src/components/pages/Index"; // Adjust based on your file structure

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider content="Tooltip content goes here">
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>

//     {/* Your other components */}
//   </QueryClientProvider>
// );

// export default App;



// 1st atmpt


// import { TooltipProvider } from "./components/ui/tooltip";  // Make sure this import is correct
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./components/pages/Login"; // Adjust path if needed
// import Index from "./components/pages/Index"; // Adjust based on your file structure

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider content="Tooltip content goes here">
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//           <Route path="/login" element={<Login />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>

//     {/* Your other components */}
//   </QueryClientProvider>
// );

// export default App;



//2nd attemt


import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "../src/components/layouts/Sidebar";
import Index from "../src/components/pages/Index";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider >
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;