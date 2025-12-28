import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import { ChatProvider } from "@/context/ChatContext"; 
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { PromptProvider } from "@/context/PromptContext";

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
            <ToastProvider>
              <ConfirmProvider>
                <PromptProvider>
                  {children}
                </PromptProvider>
              </ConfirmProvider>
            </ToastProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
