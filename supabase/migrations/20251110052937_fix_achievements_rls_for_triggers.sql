/*
  # Fix Achievements RLS for Trigger Functions

  1. Problem
    - The trigger functions run with the privileges of the user who triggered them
    - The INSERT policy "System can create achievements" has WITH CHECK (true) which requires a USING clause
    - This causes the trigger to fail when trying to insert achievements
  
  2. Changes
    - Drop the existing INSERT policy with problematic USING expression
    - Create new INSERT policy that allows authenticated users to insert achievements
    - This allows the trigger functions to insert achievements when users perform actions
  
  3. Security
    - Keep RLS enabled
    - Keep SELECT policy for viewing achievements
    - Allow INSERT for authenticated users (needed for triggers to work)
*/

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "System can create achievements" ON achievements;

-- Create new INSERT policy that allows authenticated users to insert
-- This is required for trigger functions to work properly
CREATE POLICY "Allow authenticated users to create achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
