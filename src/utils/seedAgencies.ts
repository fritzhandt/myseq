import { supabase } from '@/integrations/supabase/client';

// Agency data extracted from the PDF
const agencyData = [
  // NYC Agencies
  {
    name: "NYC 311 (Non-Emergency Services)",
    description: "311 is New York City's central helpline for non-emergency issues, connecting residents with the appropriate city agencies. You can call or use 311 online/app to report problems like housing code violations, noise, public safety concerns, sanitation issues, and more. 311 routes your complaint to the relevant city department and provides a reference number to track the response.",
    website: "https://nyc.gov/311",
    level: "city" as const
  },
  {
    name: "Department of Consumer and Worker Protection (DCWP)",
    description: "DCWP (formerly Consumer Affairs) enforces consumer protection laws, licenses many businesses, and handles consumer complaints in NYC. It assists with issues like scams, defective products, overcharges, illegal business practices, and workplace protections (e.g. paid sick leave, freelance payments).",
    website: "https://nyc.gov/dcwp",
    level: "city" as const
  },
  {
    name: "New York City Police Department (NYPD)",
    description: "The NYPD is the primary law enforcement agency in NYC, responsible for public safety and investigating crimes. For emergencies or crimes in progress, call 911. For non-emergency situations (noise complaints, lost property, etc.), you can contact your local precinct or call 311. Police misconduct complaints (e.g. excessive force, abuse of authority) are handled by the Civilian Complaint Review Board.",
    website: "https://nyc.gov/nypd",
    level: "city" as const
  },
  {
    name: "NYC Civilian Complaint Review Board (CCRB)",
    description: "The CCRB is an independent board that investigates complaints of police misconduct by NYPD officers. Civilians can file complaints about excessive force, discourtesy, abuse of authority, or offensive language by officers. The CCRB has subpoena power and issues findings and recommendations on these complaints.",
    website: "https://nyc.gov/ccrb",
    level: "city" as const
  },
  {
    name: "NYC Commission on Human Rights (CCHR)",
    description: "CCHR enforces the city's Human Rights Law, which prohibits discrimination in housing, employment, and public accommodations. Individuals can file complaints if they've been discriminated against based on race, religion, gender (including sexual orientation or gender identity), disability, age, etc. The Commission's Law Enforcement Bureau investigates and prosecutes these cases.",
    website: "https://nyc.gov/cchr",
    level: "city" as const
  },
  {
    name: "Department of Housing Preservation and Development (HPD)",
    description: "HPD enforces the NYC Housing Maintenance Code to ensure safe and habitable housing. Tenants can report housing issues like lack of heat or hot water, mold, pests, leaks, or unsafe conditions by calling 311. HPD inspectors respond to these complaints, issue violations to landlords, and can perform emergency repairs if needed. HPD also oversees affordable housing programs.",
    website: "https://nyc.gov/hpd",
    level: "city" as const
  },
  {
    name: "Department of Buildings (DOB)",
    description: "DOB enforces building codes and zoning regulations, issues construction permits, and inspects buildings. DOB addresses building safety issues (illegal construction, structural concerns, unsafe cranes or elevators, etc.) or building code violations (work without a permit, blocked fire exits). DOB will investigate and can issue stop-work orders or violations as needed.",
    website: "https://nyc.gov/buildings",
    level: "city" as const
  },
  {
    name: "Department of Environmental Protection (DEP)",
    description: "DEP protects NYC's environment, managing the water supply and enforcing environmental laws. It handles noise complaints (e.g. construction noise, loud music) and air quality issues in coordination with NYPD. DEP also responds to water quality problems, hazardous material spills, and pollution concerns. (For example, you can report a noisy neighbor or idling truck via 311 and it goes to DEP.)",
    website: "https://nyc.gov/dep",
    level: "city" as const
  },
  {
    name: "Department of Health and Mental Hygiene (DOHMH)",
    description: "DOHMH oversees public health in NYC. It conducts restaurant inspections and enforces health codes – you can report unsanitary restaurant conditions or food poisoning incidents to DOHMH. It also handles complaints about rodent infestations, indoor air quality (mold), lead paint, and other health hazards. DOHMH issues birth certificates, dog licenses, and runs mental health services as well.",
    website: "https://nyc.gov/health",
    level: "city" as const
  },
  {
    name: "Department of Sanitation (DSNY)",
    description: "DSNY is responsible for garbage and recycling collection, street cleaning, and snow removal. Residents can file complaints about missed trash pickups, overflowing litter baskets, illegal dumping, or unswept streets. DSNY also enforces sanitation codes (e.g. dirty sidewalks or improper waste disposal).",
    website: "https://nyc.gov/dsny",
    level: "city" as const
  },
  {
    name: "Department of Transportation (DOT)",
    description: "DOT manages much of NYC's transportation infrastructure. You can report issues like potholes, broken streetlights or traffic signals, unsafe street conditions, sidewalk defects, or missing traffic signs. DOT also oversees bike lanes, parking regulations, and street permits. Complaints can be submitted via 311 for investigation and repair scheduling.",
    website: "https://nyc.gov/dot",
    level: "city" as const
  },
  {
    name: "Taxi and Limousine Commission (TLC)",
    description: "TLC regulates NYC's yellow cabs, green cabs, ride-hail vehicles, limousines, and drivers. Riders can file complaints against taxi or ride-share drivers for issues like refusals of service, overcharging, unsafe driving, or lost property. The TLC will investigate and can discipline licensed drivers or companies. They also handle licensee complaints (e.g. drivers reporting issues with bases).",
    website: "https://nyc.gov/tlc",
    level: "city" as const
  },
  {
    name: "Administration for Children's Services (ACS)",
    description: "ACS is NYC's child welfare agency, responsible for investigating child abuse or neglect reports and protecting children. It also oversees foster care and juvenile justice. Anyone suspecting child abuse/neglect should call the State Central Register (Child Abuse Hotline at 1-800-342-3720), which ACS will respond to in NYC. ACS can be contacted for issues with foster care agencies or childcare programs as well.",
    website: "https://nyc.gov/acs",
    level: "city" as const
  },
  {
    name: "Department for the Aging (DFTA)",
    description: "DFTA provides services and support for older New Yorkers (age 60+). While it doesn't handle 'complaints' in the regulatory sense, it offers resources like senior center services, caregiver support, and can refer cases of elder abuse or neglect (such cases are often handled by NYS or law enforcement). DFTA's Elderly Crime Victims Resource Center assists older adults who have experienced crime or scams.",
    website: "https://nyc.gov/aging",
    level: "city" as const
  },
  {
    name: "Human Resources Administration (HRA/DSS)",
    description: "HRA (part of the Dept. of Social Services) administers public benefits in NYC, including SNAP (food stamps), cash assistance, Medicaid, and homelessness prevention. Clients can report issues or fair hearing appeals if they are wrongly denied benefits, experience delays, or have complaints about HRA center services. HRA also has programs for rental assistance and can handle grievances about those services.",
    website: "https://nyc.gov/hra",
    level: "city" as const
  },
  {
    name: "Department of Homeless Services (DHS)",
    description: "DHS runs NYC's homeless shelter system. If there are issues at a shelter (unsafe conditions, mistreatment, denial of services), clients can report through 311 or to DHS directly. The general public might contact DHS to request outreach for a homeless individual in need (via 311).",
    website: "https://nyc.gov/dhs",
    level: "city" as const
  },
  {
    name: "Department of Parks and Recreation (Parks Dept)",
    description: "The Parks Dept maintains city parks, playgrounds, and street trees. Residents can report issues like dangerous tree conditions (e.g. a dead tree limb), damaged playground equipment, unmaintained parks, or park rule violations. Such complaints via 311 go to Parks for resolution. They also handle permits for events and sports fields, so user issues can be directed to them.",
    website: "https://nyc.gov/parks",
    level: "city" as const
  },
  {
    name: "NYC Board of Elections (BOE)",
    description: "The NYC BOE administers local elections and voter registration in the city. It handles voter registration, polling site operations, and vote counting. Citizens can contact the BOE to report problems at poll sites, voter registration issues, or other election-related complaints. (For example, if a polling place opening is delayed or a machine is broken, BOE should be notified.)",
    website: "https://vote.nyc",
    level: "city" as const
  },
  {
    name: "NYC Department of Education (DOE)",
    description: "DOE manages the public school system (K-12) in NYC. Parents and students can raise complaints about school issues – e.g. safety, teacher misconduct, or special education services – through the school's administration or DOE's complaint channels. The DOE has an Office of Special Investigations for serious misconduct and a Family Advocate office in each district to resolve school-related concerns.",
    website: "https://schools.nyc.gov",
    level: "city" as const
  },
  {
    name: "NYC Department of Investigation (DOI)",
    description: "DOI is a city watchdog agency that investigates corruption, fraud, or misconduct in NYC government. The public can report allegations of bribery, theft of city funds, conflicts of interest, or other unethical behavior by city employees or contractors. DOI operates hotlines (e.g. for NYCHA misconduct, FDNY, DOT, etc.) and works with prosecutors on criminal cases if needed.",
    website: "https://nyc.gov/doi",
    level: "city" as const
  },
  {
    name: "NYC Conflicts of Interest Board (COIB)",
    description: "COIB enforces ethics laws for NYC public officials. Members of the public or city employees can report officials who may have conflicts of interest (e.g. using their office for personal gain). COIB can investigate and impose fines for ethics violations, though it typically handles cases internally rather than public 'complaints.'",
    website: "https://nyc.gov/coib",
    level: "city" as const
  },

  // NYS Agencies
  {
    name: "NYS Attorney General's Office (OAG)",
    description: "The state Attorney General (AG) is New York's chief legal officer. The AG's bureaus protect consumers, tenants, investors, and the public at large by enforcing state laws. Consumers can file complaints with the AG for issues like consumer fraud, scams, price gouging, wage theft, tenant harassment by landlords, and civil rights violations. The AG investigates complaints and can bring lawsuits against businesses or individuals violating laws. Notable hotlines include those for healthcare billing, student loans, and tenant rights.",
    website: "https://ag.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Division of Consumer Protection (DCP)",
    description: "Part of the Department of State, DCP serves as the state's consumer assistance office. It provides consumer education and mediates consumer complaints against businesses. If you have a dispute with a business (e.g. refund issue, defective product, service not delivered), you can file a complaint with DCP. They attempt to negotiate resolutions between consumers and companies (though they cannot force a settlement). DCP also runs the state's Do Not Call Registry and alerts consumers to scams.",
    website: "https://dos.ny.gov/consumer-protection",
    level: "state" as const
  },
  {
    name: "NYS Department of Financial Services (DFS)",
    description: "DFS regulates banks, insurance companies, and financial services in New York. If you have complaints about a bank (e.g. unfair fees, predatory lending), a mortgage lender, a debt collector, or an insurance company (denied claims, bad faith), you can file a complaint with DFS's Consumer Assistance Unit. They investigate financial fraud, enforce banking/insurance laws, and can take action against licensed institutions to protect consumers. DFS handles complaints on banking practices, mortgage servicing, robo-calls by debt collectors, auto insurance issues, etc.",
    website: "https://dfs.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Public Service Commission (PSC)",
    description: "The PSC (with the Dept. of Public Service) regulates utilities and telecommunications (electric, gas, water, landline telephone, and cable TV services) in NY. It assists consumers in resolving disputes with utility companies over bills, service quality, or outages. If you have an issue like an incorrect utility bill, trouble negotiating a payment plan, or persistent service interruptions and the utility isn't responsive, you can file a complaint with the PSC. They will mediate and can order utilities to correct problems. The PSC also has a hotline for imminent service shut-offs.",
    website: "https://dps.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Division of Human Rights (DHR)",
    description: "DHR enforces the New York State Human Rights Law, which prohibits discrimination in employment, housing, credit, and places of public accommodation statewide. Anyone who believes they've been unlawfully discriminated against (e.g. fired or not hired due to race, sex, age, disability; denied an apartment due to source of income or family status) can file a complaint with DHR. The Division investigates and, if it finds probable cause, will hold a hearing and can impose remedies. This is a state-level counterpart to NYC's CCHR, covering areas outside NYC or smaller employers not under federal law.",
    website: "https://dhr.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Department of Labor (DOL)",
    description: "DOL's Division of Labor Standards handles workplace complaints related to state labor laws. Workers can file complaints for unpaid or underpaid wages, overtime violations, minimum wage issues, or illegal deductions. DOL investigates these wage claims and can order employers to pay back wages or penalties. They also enforce child labor laws and certain workplace conditions. Additionally, DOL oversees unemployment insurance (UI) – if you have issues with UI benefits, you can contact them. For workplace safety issues, DOL enforces public employee safety (PESH) and works with OSHA for private sector.",
    website: "https://dol.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Department of Health (DOH)",
    description: "The state DOH licenses and regulates healthcare facilities – including hospitals, nursing homes, clinics, home care agencies, and adult care facilities. Patients or family members can file complaints about poor care or unsafe conditions in these facilities. For example, DOH investigates nursing home abuse/neglect complaints and hospital quality-of-care issues (there's a toll-free hotline for hospital complaints). DOH also regulates funeral homes and can take complaints about those. Additionally, DOH oversees public health matters like disease control and has hotlines for concerns such as restaurant food poisoning (in coordination with local health departments).",
    website: "https://health.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Department of Environmental Conservation (DEC)",
    description: "DEC is the state's environmental regulator, working to protect air, water, and land resources. The public can report environmental violations such as illegal dumping, water pollution discharges, hazardous waste spills, poaching or hunting violations, and other environmental hazards. DEC has hotlines (e.g. for spills or poaching) and regional offices to investigate these complaints. They enforce laws on pollution control, wildlife conservation, and parkland protection. (Note: Within NYC, many environmental complaints start with NYC DEP, but DEC handles larger issues and those outside NYC.)",
    website: "https://dec.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Homes and Community Renewal (HCR)",
    description: "HCR includes agencies that oversee housing and rent regulation. Notably, the Division of Housing and Community Renewal (DHCR) handles complaints from tenants in rent-regulated apartments (rent control or rent stabilization). Tenants can file complaints about illegal rent overcharges, failure to provide required services, harassment by landlords, or wrongful eviction attempts. DHCR will investigate and can issue orders (e.g. rent reductions for lack of heat/hot water). HCR also runs affordable housing programs and monitors local housing authorities.",
    website: "https://hcr.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Office of the Inspector General (OIG)",
    description: "The State OIG investigates fraud, corruption, or abuse in state executive agencies. Citizens or state employees can report graft, contract fraud, misuse of funds, or misconduct by state officials. For example, if a state employee is taking bribes or a contractor is defrauding a state program, OIG looks into it. There are also specialized inspectors general (e.g. for the MTA, Port Authority, Welfare system, etc.). Complaints can be filed confidentially.",
    website: "https://ig.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Commission on Judicial Conduct",
    description: "This Commission is an independent state agency that investigates complaints of misconduct by state judges (from town court justices up to NY appellate judges). If someone believes a judge behaved unethically – e.g. showed bias, conflicts of interest, or improper demeanor – they can file a complaint. The Commission reviews and, if warranted, can discipline judges (censure or even remove from office).",
    website: "https://cjc.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Department of Motor Vehicles (DMV)",
    description: "In addition to driver licensing and vehicle registration, NYS DMV regulates auto dealers, repair shops, inspection stations, and driving schools. Consumers can file complaints with DMV's Vehicle Safety unit if an auto dealer sold a defective car without disclosure, a repair shop did substandard or fraudulent work, or an inspection station is engaging in illegal practices. The DMV investigates these complaints and can suspend or fine the business, as well as help consumers recover titles, refunds, or necessary repairs. (Note: Complaints must usually be filed within 90 days or 3,000 miles of a repair issue.)",
    website: "https://dmv.ny.gov",
    level: "state" as const
  },
  {
    name: "NYS Department of State – Division of Licensing Services",
    description: "This office licenses various occupations (real estate agents, barbers/cosmetologists, notaries, security guards, etc.). If you have a complaint about a licensed professional in these categories – say a real estate broker engaged in fraud or a cosmetologist caused harm via negligence – you can file a complaint with Licensing Services. They investigate violations of licensing laws and can suspend or revoke licenses.",
    website: "https://dos.ny.gov/licensing",
    level: "state" as const
  },
  {
    name: "NYS Board of Elections",
    description: "The State Board oversees election administration and campaign finance for New York. Voters or advocates can report election law violations – such as voter suppression tactics, campaign finance irregularities, or issues with how local boards conduct elections. The Board has an enforcement counsel to investigate complaints about, for example, illegal campaign contributions or spending. They also handle statewide voter registration issues in coordination with county boards.",
    website: "https://elections.ny.gov",
    level: "state" as const
  },
  {
    name: "Metropolitan Transportation Authority (MTA)",
    description: "The MTA is a state-chartered authority running NYC's subways, buses, Staten Island Railway, as well as the Long Island Rail Road (LIRR), Metro-North Railroad, and other transit services. Commuters can submit complaints about transit service – e.g. dirty or unsafe subway stations, persistent train delays, employee misconduct, overcharged fares on MetroCard, etc. – through MTA's customer feedback lines. The MTA investigates customer complaints and uses them to improve service quality (though it's not a regulator, it's the operator).",
    website: "https://mta.info",
    level: "state" as const
  },

  // Federal Agencies
  {
    name: "Federal Trade Commission (FTC)",
    description: "The FTC is the nation's consumer protection agency. It works to prevent fraudulent, deceptive, or unfair business practices and educate consumers on how to avoid scams. Complaints can be filed with the FTC about scams (e.g. identity theft, impostor calls, internet fraud), false advertising, telemarketer abuses (like Do Not Call violations), and anticompetitive business behavior. While the FTC doesn't resolve individual disputes, every report helps them identify patterns and take action (lawsuits or rule-making) against offenders. They maintain a public fraud database and share data with law enforcement.",
    website: "https://ftc.gov",
    level: "federal" as const
  },
  {
    name: "Consumer Financial Protection Bureau (CFPB)",
    description: "The CFPB protects consumers in the financial sector. It accepts complaints about financial products and services such as bank accounts, credit cards, mortgages, student loans, auto loans, debt collection, credit reporting, and payday lending. If you submit a complaint, the CFPB will forward it to the company for a response and keep you updated (many consumers get issues resolved this way). The CFPB also uses complaint data to enforce laws and issue regulations.",
    website: "https://consumerfinance.gov",
    level: "federal" as const
  },
  {
    name: "Federal Communications Commission (FCC)",
    description: "The FCC regulates interstate communications via telephone, cellphones, cable, radio, satellite, and TV. Consumers can file FCC complaints about issues like telecom billing problems, phone cramming (unauthorized charges), broadband service issues, indecent content on TV/radio, reception problems, or robocalls and spam texts. The FCC's Consumer Complaint Center will address your issue or direct it to the provider for resolution. While not all individual complaints result in an FCC ruling, they help the FCC enforce rules and sometimes result in refunds or improved practices.",
    website: "https://fcc.gov",
    level: "federal" as const
  },
  {
    name: "U.S. Food and Drug Administration (FDA)",
    description: "The FDA oversees the safety of foods, drugs, medical devices, cosmetics, and more. The public can report problems with FDA-regulated products – for instance, contaminated food, adverse drug reactions, defective medical devices, or tainted dietary supplements. The FDA has specific reporting systems (e.g. MedWatch for medications and devices, the Safety Reporting Portal for foods, and VAERS for vaccine side effects). These reports can trigger investigations, recalls, or safety alerts.",
    website: "https://fda.gov",
    level: "federal" as const
  },
  {
    name: "Consumer Product Safety Commission (CPSC)",
    description: "The CPSC protects the public from dangerous consumer products (except for autos, foods, etc. covered by other agencies). It oversees thousands of product categories (from toys and appliances to furniture and electronics) and can issue recalls. Consumers should report unsafe products or product-related injuries to the CPSC – for example, an appliance that caught fire, a toy that poses a choking hazard, or any product that caused serious injury. CPSC's database (SaferProducts.gov) lets you search and submit reports, which the agency uses to investigate hazards.",
    website: "https://cpsc.gov",
    level: "federal" as const
  },
  {
    name: "National Highway Traffic Safety Administration (NHTSA)",
    description: "NHTSA regulates vehicle safety. Drivers can report safety defects in automobiles or auto equipment (airbags, car seats, tires, etc.) to NHTSA. If a particular defect trend emerges (for example, many people reporting brakes failing on a model), NHTSA can investigate and compel a recall. You can also complain about issues like vehicle airbag non-deployment, SUV rollover tendencies, or faulty child car seats. Additionally, NHTSA's Vehicle Safety Hotline takes reports of unsafe drivers or vehicles (e.g. commercial trucks).",
    website: "https://nhtsa.gov",
    level: "federal" as const
  },
  {
    name: "Equal Employment Opportunity Commission (EEOC)",
    description: "The EEOC is the federal agency that enforces laws against employment discrimination (based on race, sex, religion, national origin, age over 40, disability, etc.) for most workplaces. If you believe you were discriminated against at work or in hiring/firing, you can file a charge of discrimination with the EEOC. This is the first step before suing under federal civil rights laws. The EEOC will investigate and may facilitate mediation; if they find a violation (or even if not), they issue a 'right-to-sue' letter so you can go to court, and in some cases the EEOC itself takes action against employers.",
    website: "https://eeoc.gov",
    level: "federal" as const
  },
  {
    name: "U.S. Department of Housing and Urban Development (HUD)",
    description: "HUD's Office of Fair Housing and Equal Opportunity (FHEO) handles housing discrimination complaints under the federal Fair Housing Act. If you've been discriminated against in housing (e.g. denied an apartment or mortgage because of race, religion, sex, disability, having children, etc.), you can file a complaint with HUD. HUD investigates and can bring charges before an administrative law judge, or refer cases to the DOJ. Additionally, HUD oversees public housing and Section 8 programs – tenants can report issues like mismanagement or health/safety concerns in HUD-subsidized housing (though day-to-day issues often go to local housing authorities first).",
    website: "https://hud.gov",
    level: "federal" as const
  },
  {
    name: "U.S. Department of Justice (DOJ) – Civil Rights Division",
    description: "The DOJ's Civil Rights Division enforces federal statutes prohibiting discrimination by government agencies, law enforcement, or in certain sectors (like voting rights, disability rights, religious freedom, etc.). Individuals can report civil rights violations – for example, a pattern of police misconduct, discrimination by a local government, or violations of the Americans with Disabilities Act (ADA) by public entities. DOJ often uses these complaints to launch investigations or lawsuits against jurisdictions (e.g. consent decrees with police departments). While the DOJ doesn't represent individuals in private lawsuits, your complaint can prompt wider enforcement action. They have specific portals: Voting Section, Special Litigation (police/prison abuse), Disability Rights Section, etc.",
    website: "https://civilrights.justice.gov",
    level: "federal" as const
  },
  {
    name: "Occupational Safety and Health Administration (OSHA)",
    description: "OSHA (part of the U.S. Dept. of Labor) ensures workplace safety and health for most private-sector employees. Workers can file complaints with OSHA about unsafe or unhealthy working conditions – such as lack of required protective equipment, dangerous machinery, exposure to toxic chemicals, or inadequate safety protocols. OSHA will evaluate and can conduct inspections, often without revealing the complainant's identity. OSHA also protects whistleblowers from retaliation. (Note: In New York, OSHA covers private employers; public employees' safety is covered by NYS DOL Public Employee Safety & Health).",
    website: "https://osha.gov",
    level: "federal" as const
  },
  {
    name: "National Labor Relations Board (NLRB)",
    description: "The NLRB protects the rights of employees to unionize and engage in collective bargaining. If you believe an employer unfairly labor practices (e.g. firing or punishing you for union activity, or a union failing in its duty of fair representation), you can file a charge with the NLRB. They investigate and can order remedies for violations of the National Labor Relations Act. This is particularly relevant for workers facing retaliation for organizing or for employers who refuse to negotiate with a union.",
    website: "https://nlrb.gov",
    level: "federal" as const
  },
  {
    name: "Securities and Exchange Commission (SEC)",
    description: "The SEC regulates the securities industry (stocks, bonds, markets) and protects investors. If you have a tip or complaint about investment fraud, insider trading, Ponzi schemes, or other securities law violations, you can report it to the SEC. Investors who have issues with their broker or investment adviser (e.g. theft, excessive fees, misrepresentation) can also complain – the SEC may investigate or refer you to the appropriate authorities. If you have a complaint about a broker-dealer, investment adviser, or other financial professional, you can report it to the SEC. They have an online Tips, Complaints, and Referrals (TCR) system and even a whistleblower program that can award money for tips leading to enforcement actions.",
    website: "https://sec.gov",
    level: "federal" as const
  },
  {
    name: "Internal Revenue Service (IRS) – Taxpayer Advocate Service",
    description: "If you have been unable to resolve a problem with the IRS (for example, an ongoing issue with your tax return, refunds, or IRS errors causing hardship), the Taxpayer Advocate Service (TAS) can help. TAS is an independent branch within the IRS that assists individuals in getting prompt, fair resolutions when normal IRS processes break down. You can file Form 911 to request Advocate assistance. Also, to report tax fraud or evasion (like someone not paying taxes or a business off the books), the IRS has referral forms – though these do not typically yield personal updates.",
    website: "https://irs.gov/advocate",
    level: "federal" as const
  },
  {
    name: "U.S. Postal Service (USPS)",
    description: "For mail-related complaints – such as missing mail, package delivery problems, or issues with local post office service – you can contact USPS Customer Service. They have an online complaint form and phone line. If you suspect mail theft or mail fraud (like mailbox tampering, mail scams), you can also report it to the Postal Inspection Service, which is the law enforcement arm of USPS. They investigate crimes like mail fraud schemes, identity theft involving mail, etc.",
    website: "https://usps.com/help",
    level: "federal" as const
  },
  {
    name: "Transportation Security Administration (TSA)",
    description: "If you experience issues during airport security screening – for instance, improper treatment or witnessing a security lapse – you can file a complaint with TSA. They also have a program for reporting civil rights complaints (if you feel you were discriminated against or harassed during screening). TSA investigates incidents and uses feedback to improve traveler experience. Additionally, if you lose an item at a checkpoint, TSA Lost and Found can be contacted.",
    website: "https://tsa.gov",
    level: "federal" as const
  },
  {
    name: "Aviation Consumer Protection (US Dept. of Transportation)",
    description: "Air travelers can file complaints about airlines to the DOT's Aviation Consumer Protection unit. This covers issues like flight delays and cancellations, refunds owed, baggage problems (lost/damaged luggage), overbooking and denial of boarding, or fare/advertising scams by airlines. DOT forwards complaints to airlines for response and tracks them to identify patterns; in some cases (like widespread refund delays), DOT may take enforcement action. This is also where one can complain about service for passengers with disabilities (Air Carrier Access Act).",
    website: "https://transportation.gov/airconsumer",
    level: "federal" as const
  }
];

export const seedGovernmentAgencies = async () => {
  console.log('Starting to seed government agencies...');
  
  try {
    // Check if agencies already exist
    const { data: existingAgencies, error: checkError } = await supabase
      .from('government_agencies')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing agencies:', checkError);
      throw checkError;
    }

    if (existingAgencies && existingAgencies.length > 0) {
      console.log('Agencies already exist in database, skipping seed');
      return { success: true, message: 'Agencies already exist' };
    }

    // Insert agencies in batches to avoid timeout
    const batchSize = 10;
    let totalInserted = 0;

    for (let i = 0; i < agencyData.length; i += batchSize) {
      const batch = agencyData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('government_agencies')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }

      totalInserted += data?.length || 0;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} agencies`);
    }

    console.log(`Successfully seeded ${totalInserted} government agencies`);
    return { success: true, message: `Seeded ${totalInserted} agencies` };

  } catch (error) {
    console.error('Error seeding agencies:', error);
    return { success: false, error: error.message };
  }
};