import { Request, Response } from 'express';
import FinancialReport from '../models/FinancialReport';
import Sale from '../models/Sale';

// 1. Calculate Profit and Loss for a given date range
export const calculateProfitLoss = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, cogs = 0, operatingExpenses } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    // Fetch all sales within date range
    const sales = await Sale.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    let grossRevenue = 0;
    let discounts = 0;
    let taxes = 0;
    let netRevenue = 0;

    sales.forEach(sale => {
      grossRevenue += sale.subtotal;
      discounts += sale.discount || 0;
      taxes += sale.tax || 0;
      netRevenue += sale.total; // total is usually subtotal - discount + tax
    });

    const utilities = Number(operatingExpenses?.utilities || 0);
    const rent = Number(operatingExpenses?.rent || 0);
    const payroll = Number(operatingExpenses?.payroll || 0);
    const other = Number(operatingExpenses?.other || 0);

    const totalOperatingExpenses = utilities + rent + payroll + other;
    
    // Net revenue usually is subtotal - discount (tax is collected for government, so it shouldn't be in revenue? 
    // In our simplified system, let's just use what they paid (netRevenue = total - tax))
    // Wait, let's keep it simple: grossProfit = netRevenue - cogs
    const actualNetRevenue = grossRevenue - discounts;
    
    const grossProfit = actualNetRevenue - Number(cogs);
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const netProfit = operatingProfit; // Assuming no other taxes or interest

    res.json({
      startDate,
      endDate,
      grossRevenue,
      discounts,
      taxes,
      netRevenue: actualNetRevenue,
      cogs: Number(cogs),
      operatingExpenses: {
        utilities,
        rent,
        payroll,
        other
      },
      totalOperatingExpenses,
      grossProfit,
      operatingProfit,
      netProfit
    });

  } catch (error) {
    console.error('Calculate P&L Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Save a Financial Report
export const createFinancialReport = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Flatten operatingExpenses for schema
    const reportData = {
      ...data,
      utilities: data.operatingExpenses?.utilities || 0,
      rent: data.operatingExpenses?.rent || 0,
      payroll: data.operatingExpenses?.payroll || 0,
      otherExpenses: data.operatingExpenses?.other || 0,
    };

    const report = new FinancialReport(reportData);
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get all Financial Reports
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      query.startDate = { $gte: start };
      query.endDate = { $lte: end };
    }

    const reports = await FinancialReport.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Get Latest Metrics for Dashboard
export const getLatestFinancialMetrics = async (req: Request, res: Response) => {
  try {
    const latestReport = await FinancialReport.findOne().sort({ createdAt: -1 });
    const totalReportsCount = await FinancialReport.countDocuments();
    
    res.json({
      latestReport,
      totalReports: totalReportsCount
    });
  } catch (error) {
    console.error('Get Metrics Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Delete a Financial Report
export const deleteFinancialReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await FinancialReport.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
