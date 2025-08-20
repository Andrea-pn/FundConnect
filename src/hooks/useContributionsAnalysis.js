// hooks/useContributionsAnalysis.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useContributionsAnalysis = (chamaId) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState({
    totalContributions: 0,
    totalAmount: 0,
    monthlyTrend: [],
    contributionsByType: {},
    contributionsByStatus: {},
    topContributors: [],
    recentContributions: [],
    monthlyStats: {
      currentMonth: 0,
      previousMonth: 0,
      growth: 0
    }
  });

  // Analyze contributions data
  const analyzeContributions = useCallback((contributionsData) => {
    if (!contributionsData.length) {
      setAnalysis({
        totalContributions: 0,
        totalAmount: 0,
        monthlyTrend: [],
        contributionsByType: {},
        contributionsByStatus: {},
        topContributors: [],
        recentContributions: [],
        monthlyStats: {
          currentMonth: 0,
          previousMonth: 0,
          growth: 0
        }
      });
      return;
    }

    // Basic stats
    const totalContributions = contributionsData.length;
    const totalAmount = contributionsData.reduce((sum, c) => sum + c.amount, 0);
    
    // Group by type (handle missing type field)
    const contributionsByType = contributionsData.reduce((acc, c) => {
      const amount = c.amount || 0;
      const type = c.type || 'Unknown';
      
      // Keep all contribution types separate (including individual events)
      acc[type] = (acc[type] || 0) + amount;
      
      return acc;
    }, {});

   const contributionsByTypeGrouped = contributionsData.reduce((acc, c) => {
    const amount = c.amount || 0;
    const type = c.type || 'Unknown';
    
    // Check if this is an event contribution (starts with "Event:")
    if (type.startsWith('Event:')) {
      // Group all event contributions under a single "Events" category
      acc['Events'] = (acc['Events'] || 0) + amount;
    } else {
      // Keep other contribution types as they are
      acc[type] = (acc[type] || 0) + amount;
    }
    
     return acc;
    }, {});

    // Group by status (handle missing status field)
    const contributionsByStatus = contributionsData.reduce((acc, c) => {
      const status = c.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      
      const monthContributions = contributionsData.filter(c => {
        if (!c.date) return false;
        // Handle both string dates and Firestore timestamps
        const contributionDate = c.date.toDate ? c.date.toDate() : new Date(c.date);
        const contributionMonth = contributionDate.toISOString().substring(0, 7);
        return contributionMonth === monthKey;
      });
      
      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthContributions.reduce((sum, c) => sum + c.amount, 0),
        count: monthContributions.length
      });
    }
    
    // Top contributors (handle missing memberName)
    const contributorStats = contributionsData.reduce((acc, c) => {
      const memberName = c.memberName || c.member || 'Unknown Member';
      if (!acc[memberName]) {
        acc[memberName] = {
          memberName,
          totalAmount: 0,
          contributionCount: 0
        };
      }
      acc[memberName].totalAmount += c.amount;
      acc[memberName].contributionCount += 1;
      return acc;
    }, {});
    
    const topContributors = Object.values(contributorStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
    
    // Recent contributions (last 5)
    const recentContributions = contributionsData.slice(0, 5);
    
    // Monthly stats (current vs previous month)
    const currentMonth = new Date().toISOString().substring(0, 7);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString().substring(0, 7);
    
    const currentMonthAmount = contributionsData
      .filter(c => {
        if (!c.date) return false;
        const contributionDate = c.date.toDate ? c.date.toDate() : new Date(c.date);
        const contributionMonth = contributionDate.toISOString().substring(0, 7);
        return contributionMonth === currentMonth;
      })
      .reduce((sum, c) => sum + c.amount, 0);
    
    const previousMonthAmount = contributionsData
      .filter(c => {
        if (!c.date) return false;
        const contributionDate = c.date.toDate ? c.date.toDate() : new Date(c.date);
        const contributionMonth = contributionDate.toISOString().substring(0, 7);
        return contributionMonth === previousMonth;
      })
      .reduce((sum, c) => sum + c.amount, 0);
    
    const growth = previousMonthAmount > 0 
      ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100
      : 0;
    
    const newAnalysis = {
      totalContributions,
      totalAmount,
      monthlyTrend,
      contributionsByType, // This will have individual events
      contributionsByTypeGrouped, // This will have events grouped
      contributionsByStatus,
      topContributors,
      recentContributions,
      monthlyStats: {
        currentMonth: currentMonthAmount,
        previousMonth: previousMonthAmount,
        growth: Math.round(growth * 100) / 100
      }
    };
    
    setAnalysis(newAnalysis);
  }, []);

  // Fetch contributions data with real-time updates
  useEffect(() => {
    if (!chamaId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const contributionsQuery = query(
        collection(db, 'contributions'),
        where('chamaId', '==', chamaId),
        orderBy('date', 'desc')
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(
        contributionsQuery,
        (snapshot) => {
          const contributionsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Handle different date formats
              date: data.date || new Date(),
              // Ensure amount is a number
              amount: parseFloat(data.amount) || 0
            };
          });
          
          setContributions(contributionsData);
          analyzeContributions(contributionsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching contributions:', error);
          setError('Failed to load contributions data: ' + error.message);
          setLoading(false);
        }
      );
      
      // Return cleanup function
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up contributions listener:', error);
      setError('Failed to setup contributions listener: ' + error.message);
      setLoading(false);
    }
  }, [chamaId, analyzeContributions]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (!chamaId) return;
    
    try {
      setLoading(false);
      setError('');
      
      const contributionsQuery = query(
        collection(db, 'contributions'),
        where('chamaId', '==', chamaId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(contributionsQuery);
      const contributionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date || new Date(),
          amount: parseFloat(data.amount) || 0
        };
      });
      
      setContributions(contributionsData);
      analyzeContributions(contributionsData);
      
    } catch (error) {
      console.error('Error refetching contributions:', error);
      setError('Failed to refetch contributions data');
    } finally {
      setLoading(false);
    }
  }, [chamaId, analyzeContributions]);

  return {
    contributions,
    analysis,
    loading,
    error,
    refetch
  };
};