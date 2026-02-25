import { Link } from "react-router";
import { Home, UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center animate-fade-in">
        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed className="w-16 h-16 text-gray-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-sib-blue mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Блюдо не найдено!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Похоже, эта страница растворилась, как горячий суп. 
          Давайте вернёмся в меню?
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-sib-blue hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors hover:scale-105 transform"
        >
          <Home className="w-5 h-5" />
          Вернуться в меню
        </Link>
      </div>
    </div>
  );
}
