import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Car, Crown, QrCode } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-fac-blue-900">Profile</h1>
              <p className="text-fac-blue-700">Your FAC membership details</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-fac-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-fac-blue-600" />
            </div>
            <CardTitle className="text-2xl">User Profile Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              This feature will include user details, car information,
              membership status, and QR code for branch scanning.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Car className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Vehicle Info</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Crown className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Membership</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <QrCode className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">QR Code</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <User className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
