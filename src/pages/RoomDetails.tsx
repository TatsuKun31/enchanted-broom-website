import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const RoomDetails = () => {
  const [rooms, setRooms] = useState({
    fullBath: 0,
    halfBath: 0,
    primaryBedroom: 0,
    additionalBedrooms: 0,
    livingRoom: 0,
    diningRoom: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Room details submitted:", rooms);
  };

  return (
    <div className="min-h-screen bg-purple-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-purple-dark">
              Tell us about your space
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(rooms).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) =>
                        setRooms((prev) => ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-primary hover:bg-purple-primary/90"
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoomDetails;