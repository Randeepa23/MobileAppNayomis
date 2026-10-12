import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Volume2,
  VolumeX,
  Settings,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Order notifications
    orderConfirmation: true,
    orderReady: true,
    orderDelivered: true,
    orderCancelled: true,
    
    // Marketing notifications
    promotions: false,
    newMenuItems: true,
    specialOffers: false,
    loyaltyUpdates: true,
    
    // Communication preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    whatsappNotifications: true,
    
    // Sound preferences
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Contact information
    phoneNumber: '',
    whatsappNumber: '',
    preferredLanguage: 'english'
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleInputChange = (setting: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement API call to save notification settings
      toast.success('Notification settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600">Customize how and when you receive notifications</p>
      </div>

      {/* Order Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Order Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-confirmation">Order Confirmation</Label>
                <p className="text-sm text-gray-600">Get notified when your order is confirmed</p>
              </div>
              <Switch
                id="order-confirmation"
                checked={settings.orderConfirmation}
                onCheckedChange={() => handleToggle('orderConfirmation')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-ready">Order Ready</Label>
                <p className="text-sm text-gray-600">Get notified when your order is ready for pickup</p>
              </div>
              <Switch
                id="order-ready"
                checked={settings.orderReady}
                onCheckedChange={() => handleToggle('orderReady')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-delivered">Order Delivered</Label>
                <p className="text-sm text-gray-600">Get notified when your order is delivered</p>
              </div>
              <Switch
                id="order-delivered"
                checked={settings.orderDelivered}
                onCheckedChange={() => handleToggle('orderDelivered')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-cancelled">Order Cancellation</Label>
                <p className="text-sm text-gray-600">Get notified if your order is cancelled</p>
              </div>
              <Switch
                id="order-cancelled"
                checked={settings.orderCancelled}
                onCheckedChange={() => handleToggle('orderCancelled')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Marketing Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Marketing & Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotions">Promotions</Label>
                <p className="text-sm text-gray-600">Receive promotional offers and discounts</p>
              </div>
              <Switch
                id="promotions"
                checked={settings.promotions}
                onCheckedChange={() => handleToggle('promotions')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-menu">New Menu Items</Label>
                <p className="text-sm text-gray-600">Be the first to know about new dishes</p>
              </div>
              <Switch
                id="new-menu"
                checked={settings.newMenuItems}
                onCheckedChange={() => handleToggle('newMenuItems')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="special-offers">Special Offers</Label>
                <p className="text-sm text-gray-600">Limited time offers and flash sales</p>
              </div>
              <Switch
                id="special-offers"
                checked={settings.specialOffers}
                onCheckedChange={() => handleToggle('specialOffers')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="loyalty-updates">Loyalty Program Updates</Label>
                <p className="text-sm text-gray-600">Points balance and tier status updates</p>
              </div>
              <Switch
                id="loyalty-updates"
                checked={settings.loyaltyUpdates}
                onCheckedChange={() => handleToggle('loyaltyUpdates')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Communication Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Communication Channels</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
              </div>
              <Switch
                id="whatsapp-notifications"
                checked={settings.whatsappNotifications}
                onCheckedChange={() => handleToggle('whatsappNotifications')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sound & Vibration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Sound & Vibration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <Label htmlFor="sound-enabled">Sound Notifications</Label>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={() => handleToggle('soundEnabled')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="vibration-enabled">Vibration</Label>
              </div>
              <Switch
                id="vibration-enabled"
                checked={settings.vibrationEnabled}
                onCheckedChange={() => handleToggle('vibrationEnabled')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  value={settings.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input
                  id="whatsapp-number"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="Enter your WhatsApp number"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end"
      >
        <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </motion.div>
    </div>
  );
};