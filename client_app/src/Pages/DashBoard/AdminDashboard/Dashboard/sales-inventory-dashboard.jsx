import React, { useState, useEffect } from "react";
import SalesOverview from "./sales-overview";
import InventoryOverview from "./inventory-overview";
import RecentOrders from "./recent-orders";
import DateRangeFilter from "./date-range-filter";
import TopSellingProducts from "./top-selling-products";
import { Users, ShoppingBag, Clock, TrendingUp } from "lucide-react";

import axios from 'axios';

import { format, eachDayOfInterval } from 'date-fns';

export default function SalesInventoryDashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });

  const handleDateRangeChange = (start, end) => {
    setDateRange({ start, end });
  };

  const [activeTab, setActiveTab] = useState("sales");


  const [statsData, setStatsData] = useState({}); // State to store stats


  // Fetch stats data from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/orders/stats/main-overview', {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        });
        setStatsData(response.data.data);
      } catch (err) {
        //setError(err.message);
      } finally {
        //setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange.end, dateRange.start]);



  // Updated stats configuration with Lucide icons
  const stats = [
    {
      id: 1,
      label: "Total Customers",
      value: statsData.totalCustomers || 0,
      icon: <Users className="w-6 h-6 text-base" />,
      bgColor: "bg-base/5",
      textColor: "text-base"
    },
    {
      id: 2,
      label: "Completed Orders",
      value: statsData.completedOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-base" />,
      bgColor: "bg-base/5",
      textColor: "text-base"
    },
    {
      id: 3,
      label: "Pending Orders",
      value: statsData.pendingOrders || 0,
      icon: <Clock className="w-6 h-6 text-base" />,
      bgColor: "bg-base/5",
      textColor: "text-base"
    },
    {
      id: 4,
      label: "Total Sales",
      value: statsData.totalOversales ? `₱${statsData.totalOversales.toLocaleString()}` : "₱0",
      icon: <TrendingUp className="w-6 h-6 text-base" />,
      bgColor: "bg-base/5",
      textColor: "text-base"
    },
  ];





  const [salesData, setSalesData] = useState([]);
  const [salesByItemArray, setSalesByItemArray] = useState([]);

  const formatSalesData = (data) => {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),  // Format date to 'yyyy-MM-dd'
      sales: item.totalSales, // Use the quantity as the sales number
    }));
  };

  useEffect(() => {
    const fetchSalesData = async () => {

      const response = await axios.get('/orders/stats/sales-overview', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });
      const formattedData = formatSalesData(response.data.salesData);  // Format the API response

      // console.log({ formattedData })
      setSalesData(formattedData);  // Store formatted data in state
      setSalesByItemArray(response.data.salesByItemArray)
    };

    fetchSalesData();  // Call the function when the component mounts
  }, [dateRange.start, dateRange.end]);  // Dependency array ensures effect is triggered on startDate or endDate change



  console.log({ salesData })


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-xl p-6 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-white/50">
                {stat.icon}
              </div>
              <div>
                <p className={`${stat.textColor} text-2xl font-semibold`}>
                  {stat.value}
                </p>
                <p className="text-gray-600 text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <DateRangeFilter
          setDateRange={setDateRange}
          onFilterChange={handleDateRangeChange}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2">
          <button
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-colors
              ${activeTab === "sales"
                ? "bg-base text-white"
                : "hover:bg-gray-50 text-gray-600"
              }`}
            onClick={() => setActiveTab("sales")}
          >
            Sales
          </button>
          <button
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-colors
              ${activeTab === "inventory"
                ? "bg-base text-white"
                : "hover:bg-gray-50 text-gray-600"
              }`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {/* <div className="space-y-6">
        {activeTab === "sales" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <SalesOverview
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <RecentOrders
                dateRange={dateRange}
                salesData={salesData}
              />
            </div>
          </>
        )}

        {activeTab === "inventory" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <InventoryOverview
                setDateRange={setDateRange}
                dateRange={dateRange}
                salesByItemArray={salesByItemArray}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <TopSellingProducts
                dateRange={dateRange}
                salesByItemArray={salesByItemArray}
              />
            </div>
          </>
        )}
      </div> */}
    </div>
  );
}
