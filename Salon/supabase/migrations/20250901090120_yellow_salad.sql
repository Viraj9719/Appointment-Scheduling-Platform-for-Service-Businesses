/*
  # Shalika Salon Database Schema

  1. New Tables
    - `users` - Extended user profiles with salon-specific data
      - `id` (uuid, primary key) - Links to Supabase auth.users
      - `email` (text, unique) - User email address
      - `full_name` (text) - Full name of user
      - `phone` (text) - Contact phone number
      - `role` (text) - Either 'customer' or 'barber'
      - `created_at` (timestamp) - Account creation time
      - `updated_at` (timestamp) - Last profile update

    - `services` - Available salon services
      - `id` (uuid, primary key) - Unique service identifier
      - `name` (text) - Service name (e.g., "Haircut", "Head Massage")
      - `description` (text) - Detailed service description
      - `duration_minutes` (integer) - Service duration in minutes
      - `price` (decimal) - Service price in LKR
      - `is_active` (boolean) - Whether service is currently offered
      - `created_at` (timestamp) - Service creation time
      - `updated_at` (timestamp) - Last service update

    - `appointments` - Customer appointment bookings
      - `id` (uuid, primary key) - Unique appointment identifier
      - `customer_id` (uuid, foreign key) - References users table
      - `service_id` (uuid, foreign key) - References services table
      - `barber_id` (uuid, foreign key, nullable) - Assigned barber
      - `appointment_date` (date) - Scheduled appointment date
      - `appointment_time` (time) - Scheduled appointment time
      - `status` (text) - 'scheduled', 'confirmed', 'completed', 'cancelled'
      - `payment_method` (text) - 'cash' or 'online'
      - `payment_status` (text) - 'pending', 'paid', 'refunded'
      - `total_amount` (decimal) - Total appointment cost
      - `cancellation_fee` (decimal, nullable) - Fee charged for cancellations
      - `notes` (text, nullable) - Additional appointment notes
      - `created_at` (timestamp) - Booking creation time
      - `updated_at` (timestamp) - Last appointment update

  2. Security
    - Enable RLS on all tables
    - Users can read/update their own profile data
    - Customers can read/create their own appointments
    - Barbers can read all appointments and update status
    - Only authenticated users can access services
    - Appointment history is private to each customer

  3. Data Population
    - Insert default salon services (haircut, head massage, etc.)
    - Set appropriate pricing and duration for each service
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'barber')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 30,
  price decimal(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES users(id) ON DELETE SET NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'online')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  cancellation_fee decimal(10,2) DEFAULT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Services policies (all authenticated users can read services)
CREATE POLICY "All authenticated users can read services"
  ON services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Barbers can update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'barber'
    )
  );

-- Appointments policies
CREATE POLICY "Customers can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Barbers can read all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'barber'
    )
  );

CREATE POLICY "Barbers can update appointment status"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'barber'
    )
  );

CREATE POLICY "Customers can cancel own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() AND status = 'scheduled');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default services
INSERT INTO services (name, description, duration_minutes, price) VALUES
('Classic Haircut', 'Professional haircut with wash and styling', 45, 1500),
('Premium Haircut', 'Luxury haircut with consultation, wash, cut, and premium styling', 60, 2500),
('Head Massage', 'Relaxing head and scalp massage with premium oils', 30, 1000),
('Hair Wash & Blow Dry', 'Professional hair wash with blow dry and basic styling', 30, 800),
('Beard Trim', 'Professional beard trimming and shaping', 20, 600),
('Hair Treatment', 'Deep conditioning hair treatment with nourishing mask', 45, 2000),
('Eyebrow Threading', 'Precise eyebrow shaping using traditional threading technique', 15, 400),
('Face Cleanup', 'Complete facial cleanup with steam and moisturizing', 50, 1800)
ON CONFLICT (name) DO NOTHING;