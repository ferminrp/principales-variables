import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-8">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Project Creator Section */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative overflow-hidden" style={{ borderRadius: "50%" }}>
                <Image 
                  src="/jSlYyvDj_400x400.jpg" 
                  alt="@ferminrp"
                  width={48}
                  height={48}
                  style={{ 
                    objectFit: "cover",
                    borderRadius: "50%",
                    width: "100%",
                    height: "100%" 
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Proyecto creado por</span>
                <Link 
                  href="https://x.com/ferminrp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @ferminrp
                </Link>
              </div>
            </div>
            
            {/* Coffee Invitation */}
            <Link 
              href="https://ferminrp.com/cafecito" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <span role="img" aria-label="coffee">☕</span> Invitame un cafecito
            </Link>
          </div>
          
          {/* Friendly Websites */}
          <div className="flex flex-col">
            <h3 className="font-semibold mb-2">Páginas Amigas</h3>
            <ul className="space-y-1">
              {[
                { name: "comparatasas.ar", url: "https://comparatasas.ar" },
                { name: "cedears.ar", url: "https://cedears.ar" },
                { name: "usdc.ar", url: "https://usdc.ar" },
                { name: "icons.com.ar", url: "https://icons.com.ar" },
                { name: "dolarya.info", url: "https://dolarya.info" },
                { name: "argentinadatos.com", url: "https://argentinadatos.com" },
                { name: "dolarito.ar", url: "https://dolarito.ar" },
              ].map((site) => (
                <li key={site.name}>
                  <Link 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                  >
                    <Heart className="h-4 w-4 stroke-blue-600" /> {site.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 