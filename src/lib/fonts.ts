import { Inter, Lora } from "next/font/google";

// Fonts used by the Figma dashboard and My Vision designs.
// Apply `lora.variable` and `inter.variable` on the page's <main>.
export const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
