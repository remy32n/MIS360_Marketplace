import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export function SignupPage() {
  const [accountType, setAccountType] = useState<'STUDENT' | 'ORG'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    orgName: '',
    orgType: '',
    contactEmail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, orgType: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.endsWith('@depaul.edu')) {
      toast({
        title: "Invalid email",
        description: "Please use a valid @depaul.edu email address for your main account.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.signup({
        ...formData,
        role: accountType
      });
      toast({
        title: "Account created!",
        description: "Please log in to continue.",
      });
      navigate('/login');
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold font-serif text-primary">Join Free Stuff</CardTitle>
          <CardDescription>
            Create an account to discover or post giveaways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${accountType === 'STUDENT' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAccountType('STUDENT')}
            >
              Student Account
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${accountType === 'ORG' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAccountType('ORG')}
            >
              Organization Account
            </button>
          </div>

          {accountType === 'ORG' && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Review Required</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Organization accounts require admin verification before posting. This usually takes 24 hours.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">DePaul Email</Label>
              <Input id="email" type="email" placeholder="name@depaul.edu" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>

            {accountType === 'ORG' && (
              <>
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" value={formData.orgName} onChange={handleChange} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orgType">Organization Type</Label>
                  <Select onValueChange={handleSelectChange} value={formData.orgType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student Org">Student Org</SelectItem>
                      <SelectItem value="University Department">University Department</SelectItem>
                      <SelectItem value="Faculty & Staff">Faculty & Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Public Contact Email (Optional)</Label>
                  <Input id="contactEmail" type="email" placeholder="org@depaul.edu" value={formData.contactEmail} onChange={handleChange} />
                </div>
              </>
            )}

            <Button className="w-full mt-6" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in &rarr;
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
