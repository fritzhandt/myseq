-- Fix district formatting for Toby Ann Stavisky and John Liu
UPDATE elected_officials 
SET district = 'District 11'
WHERE name = 'Toby Ann Stavisky';

UPDATE elected_officials 
SET district = 'District 16'
WHERE name = 'John Liu';