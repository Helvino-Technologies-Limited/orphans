import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Home, Utensils, Shield, Star, ArrowRight, ChevronDown, Menu, X } from 'lucide-react';

const stats = [
  { value: '120+', label: 'Children Supported' },
  { value: '35+', label: 'Dedicated Staff' },
  { value: '12+', label: 'Years of Service' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const gallery = [
  {
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop',
    label: 'Joyful Learning',
    span: 'col-span-2 row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80&auto=format&fit=crop',
    label: 'Nutritious Meals',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=600&q=80&auto=format&fit=crop',
    label: 'Medical Care',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop',
    label: 'Safe Home',
    span: '',
  },
  {
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80&auto=format&fit=crop',
    label: 'Outdoor Play',
    span: '',
  },
];

const services = [
  {
    icon: <Home className="w-6 h-6" />,
    title: 'Safe Shelter',
    desc: 'A secure, warm home where every child feels protected and loved around the clock.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Utensils className="w-6 h-6" />,
    title: 'Nutrition & Meals',
    desc: 'Balanced, healthy meals prepared daily to ensure every child grows strong and healthy.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Healthcare',
    desc: 'On-site nursing, regular check-ups, vaccinations and mental wellness support.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Education',
    desc: 'Dedicated tutors, school sponsorships and enrichment activities to unlock potential.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Child Protection',
    desc: 'Strict safeguarding policies and trained staff ensure every child is safe and heard.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Talent Development',
    desc: 'Sports, arts, music and vocational training to help children discover their gifts.',
    color: 'bg-yellow-50 text-yellow-600',
  },
];

const testimonials = [
  {
    text: '"This home gave my child a future I could never have provided. The love and care here is extraordinary."',
    name: 'Grace M.', role: 'Guardian',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80&auto=format&fit=crop&face',
  },
  {
    text: '"Watching these children blossom every day is the greatest privilege. This team is truly exceptional."',
    name: 'Dr. Samuel O.', role: 'Volunteer Doctor',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80&auto=format&fit=crop',
  },
  {
    text: '"The transparency and professionalism in how donations are managed gave us full confidence to keep giving."',
    name: 'Amara D.', role: 'Donor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop',
  },
];

// Simple counter animation hook
function useCountUp(target: string, trigger: boolean) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/[\d]/g, '');
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(`${start}${suffix}`);
      if (start >= num) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target]);
  return display;
}

const StatItem: React.FC<{ value: string; label: string; trigger: boolean }> = ({ value, label, trigger }) => {
  const display = useCountUp(value, trigger);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">{display}</div>
      <div className="text-white/80 text-sm md:text-base mt-1 font-medium">{label}</div>
    </div>
  );
};

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className={`font-extrabold text-lg tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              OMMS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Services', 'Gallery', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className={`text-sm font-medium hover:text-primary-500 transition-colors ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>
                {link}
              </a>
            ))}
            <button onClick={() => navigate('/login')}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow transition-all hover:shadow-lg">
              Staff Login
            </button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-3 shadow-lg">
            {['About', 'Services', 'Gallery', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                className="block text-gray-700 font-medium hover:text-primary-600">{link}</a>
            ))}
            <button onClick={() => navigate('/login')} className="w-full bg-primary-600 text-white font-semibold py-2 rounded-full mt-2">
              Staff Login
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=85&auto=format&fit=crop"
          alt="Children being cared for"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary-900/60" />
        <div className="relative text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            Nurturing Every Child Since 2012
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            Every Child<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              Deserves Love
            </span>
          </h1>
          <p className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Providing shelter, education, healthcare and family — one child at a time.
            Our home is built on compassion, dignity and hope.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')}
              className="group bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 text-base">
              Enter Staff Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#about"
              className="border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all hover:bg-white/10 text-base">
              Learn More
            </a>
          </div>
        </div>
        <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 hover:text-white animate-bounce">
          <ChevronDown className="w-7 h-7" />
        </a>
      </section>

      {/* ── STATS BAND ── */}
      <section ref={statsRef} className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map(s => (
            <StatItem key={s.label} value={s.value} label={s.label} trigger={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1602030638412-bb8dcc0bc8b0?w=800&q=80&auto=format&fit=crop"
                alt="Caregiver with children"
                className="w-full h-[480px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-200" />
              </div>
              <div>
                <div className="font-extrabold text-2xl text-gray-900">10,000+</div>
                <div className="text-xs text-gray-500 font-medium">Meals Served Monthly</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3">Who We Are</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              A Home Built on<br />
              <span className="text-primary-600">Compassion</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              For over a decade, our orphanage has been a beacon of hope for vulnerable children.
              We believe that every child — regardless of background — deserves to grow up feeling
              safe, loved, educated and valued.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our dedicated team of caregivers, nurses, teachers and social workers work around
              the clock to ensure each child thrives physically, emotionally and academically.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Licensed & Accredited', 'Transparent Management', 'Child-First Approach'].map(tag => (
                <span key={tag} className="bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full border border-primary-100">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3">What We Provide</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Holistic Child Care</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              We address every dimension of a child's wellbeing — from a full belly to a bright future.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md border border-gray-100 transition-shadow group">
                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center mb-5`}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3">Life at Our Home</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Moments of Joy</h2>
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            A glimpse into the daily life of love, laughter and growth within our walls.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px]">
          {/* large featured image */}
          <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden shadow-lg relative group">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80&auto=format&fit=crop"
              alt="Children learning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-5">
              <span className="text-white font-bold text-lg">Joyful Learning</span>
            </div>
          </div>
          {[
            { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop', label: 'Healthy Meals' },
            { url: 'https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=600&q=80&auto=format&fit=crop', label: 'Medical Care' },
            { url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80&auto=format&fit=crop', label: 'Outdoor Play' },
            { url: 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?w=600&q=80&auto=format&fit=crop', label: 'Our Home' },
          ].map(item => (
            <div key={item.label} className="rounded-3xl overflow-hidden shadow-md relative group">
              <img src={item.url} alt={item.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent p-4">
                <span className="text-white font-semibold text-sm">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gradient-to-br from-primary-700 to-primary-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary-300 font-bold text-sm uppercase tracking-widest mb-3">Voices</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">What People Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-7 hover:bg-white/15 transition-colors">
                <p className="text-white/90 text-sm leading-relaxed mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-primary-300 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-3xl p-12 md:p-16 shadow-sm">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Be Part of the Story
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Whether you're a donor, volunteer or partner — your support changes lives.
              Our staff portal keeps everything organised so no child falls through the cracks.
            </p>
            <button onClick={() => navigate('/login')}
              className="group bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 text-lg mx-auto">
              Access Staff Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-white font-bold">OMMS</span>
            <span className="text-gray-600 mx-2">·</span>
            <span className="text-xs">Orphanage Management & Monitoring System</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Powered by{' '}
            <span className="text-primary-400 font-semibold">Helvino Technologies</span>
          </p>
        </div>
      </footer>

      {/* Ken Burns keyframe */}
      <style>{`
        @keyframes kenburns {
          from { transform: scale(1.05) translate(0, 0); }
          to   { transform: scale(1.12) translate(-1%, -1%); }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
