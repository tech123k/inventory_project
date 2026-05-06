// import Sidebar from './Sidebar';

// export default function Layout({ children, bg = '#f8fafc' }) {
//   return (
//     <div className="flex min-h-screen" style={{ background: bg }}>
//       <Sidebar />
//       <main className="flex-1 lg:ml-64 min-h-screen" style={{ background: bg }}>
//         <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 page-enter">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }
import Sidebar from './Sidebar';

export default function Layout({ children, bg = '#f8fafc' }) {
  return (
    <div className="min-h-screen" style={{ background: bg }}>
      
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="
          lg:ml-64
          min-w-0
          overflow-hidden
          min-h-screen
        "
        style={{ background: bg }}
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}