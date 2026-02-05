import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import {
  Car,
  Droplets,
  MapPin,
  Star,
  Shield,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function Index() {
  const isAuthenticated = authService.isAuthenticated();

  const features = [
    {
      icon: Car,
      title: "Professional Car Care",
      description: "Expert washing, detailing, and coating services",
    },
    {
      icon: Droplets,
      title: "Quality Products",
      description: "Premium chemicals and materials for best results",
    },
    {
      icon: MapPin,
      title: "Multiple Locations",
      description: "Convenient branches across the city",
    },
    {
      icon: Clock,
      title: "Quick Service",
      description: "Fast turnaround without compromising quality",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Trained professionals with years of experience",
    },
    {
      icon: Star,
      title: "Customer Satisfaction",
      description: "Highly rated by thousands of satisfied customers",
    },
  ];

  const services = [
    {
      name: "Car Wash",
      description: "Professional exterior and interior cleaning",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Auto Detailing",
      description: "Complete restoration and protection services",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Graphene Coating",
      description: "Long-lasting protective coating application",
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Maintenance",
      description: "Regular care and preservation programs",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-fac-orange-50/30 to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-fac-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-fac-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">FAC</span>
            </div>
            <span className="font-bold text-lg text-foreground">Fayeed Auto Care</span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/admin-dashboard">
                <Button className="bg-fac-orange-500 hover:bg-fac-orange-600">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-fac-orange-200">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-fac-orange-500 hover:bg-fac-orange-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-fac-orange-100 text-fac-orange-700 text-sm font-semibold">
                Premium Auto Care Solutions
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Your Vehicle Deserves the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fac-orange-500 to-orange-600">
                Best Care
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Experience premium car washing, professional detailing, and advanced protective coatings at Fayeed Auto Care. Trust our expert team for exceptional results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isAuthenticated && (
                <>
                  <Link to="/signup" className="flex">
                    <Button size="lg" className="bg-fac-orange-500 hover:bg-fac-orange-600 text-lg">
                      Book Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/login" className="flex">
                    <Button size="lg" variant="outline" className="border-fac-orange-200 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link to="/admin-dashboard" className="flex">
                  <Button size="lg" className="bg-fac-orange-500 hover:bg-fac-orange-600 text-lg">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="relative h-96 md:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-r from-fac-orange-500/20 to-orange-500/20 rounded-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🚗</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Fayeed Auto Care?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine expertise, quality products, and dedication to deliver outstanding results for your vehicle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border-fac-orange-100 hover:border-fac-orange-300 transition">
                <CardContent className="pt-6">
                  <Icon className="w-12 h-12 text-fac-orange-500 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for every aspect of your vehicle's care and maintenance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <Card key={idx} className="overflow-hidden border-0 hover:shadow-lg transition">
              <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {service.name}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-fac-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Vehicle?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and experience premium auto care service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-lg">
                  Book a Service <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-fac-orange-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Fayeed Auto Care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
