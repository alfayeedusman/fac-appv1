import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

export default function Booking() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-fac-blue-900">Booking</h1>
            <p className="text-fac-blue-700">Schedule your car wash</p>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-fac-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-10 w-10 text-fac-blue-600" />
            </div>
            <CardTitle className="text-2xl">
              Booking System Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Book your car wash appointments and view your service history.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Schedule</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">History</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
