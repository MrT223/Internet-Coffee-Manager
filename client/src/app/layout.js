import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import { ChatProvider } from "@/context/ChatContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CyberOps Gaming",
  description: "Quản lý phòng máy chuyên nghiệp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
