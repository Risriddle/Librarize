import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center py-6 px-4 bg-gradient-to-t from-amber-950 to-amber-900 text-amber-300 border-t border-amber-800 shadow-inner">
      <div className="flex justify-center mb-2">
        <div className="relative w-14 h-14 overflow-hidden rounded-full border-2 border-amber-400 shadow-md hover:scale-105 transition-transform duration-300">
          <Image
            src="/images/spellbook.png"
            alt="I love books"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <p className="text-lg font-semibold tracking-wide">Librarize &copy; {year}</p>
      <p className="text-sm italic mt-1 text-amber-400 max-w-md mx-auto px-2">
        &quot;The only difference between you and God is that you have forgotten you are divine.&quot; <br />
      </p>
    </footer>
  );
};

export default Footer;
