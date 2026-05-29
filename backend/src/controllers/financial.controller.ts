import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// 1. Calculate Profit and Loss for a given date range
export const calculateProfitLoss = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, cogs = 0, operatingExpenses } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['READY', 'COMPLETED'] },
      },
    });

    let grossRevenue = 0;
    let discounts = 0;
    let taxes = 0;

    sales.forEach((sale) => {
      grossRevenue += Number(sale.subtotal);
      discounts += Number(sale.discount || 0);
      taxes += Number(sale.tax || 0);
    });

    const utilities = Number(operatingExpenses?.utilities || 0);
    const rent = Number(operatingExpenses?.rent || 0);
    const payroll = Number(operatingExpenses?.payroll || 0);
    const other = Number(operatingExpenses?.other || 0);
    const totalOperatingExpenses = utilities + rent + payroll + other;

    const actualNetRevenue = grossRevenue - discounts;
    const grossProfit = actualNetRevenue - Number(cogs);
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const netProfit = operatingProfit;

    res.json({
      startDate,
      endDate,
      grossRevenue,
      discounts,
      taxes,
      netRevenue: actualNetRevenue,
      cogs: Number(cogs),
      operatingExpenses: { utilities, rent, payroll, other },
      totalOperatingExpenses,
      grossProfit,
      operatingProfit,
      netProfit,
      salesCount: sales.length,
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

    const report = await prisma.financialReport.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        grossRevenue: Number(data.grossRevenue || 0),
        discounts: Number(data.discounts || 0),
        taxes: Number(data.taxes || 0),
        netRevenue: Number(data.netRevenue || 0),
        openingStock: Number(data.openingStock || 0),
        purchases: Number(data.purchases || 0),
        closingStock: Number(data.closingStock || 0),
        cogs: Number(data.cogs || 0),
        utilities: Number(data.operatingExpenses?.utilities || 0),
        rent: Number(data.operatingExpenses?.rent || 0),
        payroll: Number(data.operatingExpenses?.payroll || 0),
        otherExpenses: Number(data.operatingExpenses?.other || 0),
        totalOperatingExpenses: Number(data.totalOperatingExpenses || 0),
        grossProfit: Number(data.grossProfit || 0),
        operatingProfit: Number(data.operatingProfit || 0),
        netProfit: Number(data.netProfit || 0),
      },
    });

    res.status(201).json({
      ...report,
      grossRevenue: Number(report.grossRevenue),
      discounts: Number(report.discounts),
      taxes: Number(report.taxes),
      netRevenue: Number(report.netRevenue),
      cogs: Number(report.cogs),
      grossProfit: Number(report.grossProfit),
      operatingProfit: Number(report.operatingProfit),
      netProfit: Number(report.netProfit),
    });
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get all Financial Reports
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      where.startDate = { gte: start };
      where.endDate = { lte: end };
    }

    const reports = await prisma.financialReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      reports.map((r) => ({
        ...r,
        grossRevenue: Number(r.grossRevenue),
        discounts: Number(r.discounts),
        taxes: Number(r.taxes),
        netRevenue: Number(r.netRevenue),
        cogs: Number(r.cogs),
        grossProfit: Number(r.grossProfit),
        operatingProfit: Number(r.operatingProfit),
        netProfit: Number(r.netProfit),
      }))
    );
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Get Latest Metrics for Dashboard
export const getLatestFinancialMetrics = async (_req: Request, res: Response) => {
  try {
    const latestReport = await prisma.financialReport.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const totalReportsCount = await prisma.financialReport.count();

    res.json({
      latestReport: latestReport
        ? {
            ...latestReport,
            grossRevenue: Number(latestReport.grossRevenue),
            netRevenue: Number(latestReport.netRevenue),
            grossProfit: Number(latestReport.grossProfit),
            netProfit: Number(latestReport.netProfit),
          }
        : null,
      totalReports: totalReportsCount,
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
    await prisma.financialReport.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
