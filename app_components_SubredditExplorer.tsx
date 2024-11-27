"use client"

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, AlertCircle } from 'lucide-react'
import PostList from './PostList';
import AnalyticsOverview from './AnalyticsOverview';
import TrendAnalysis from './TrendAnalysis';
import InsightsDashboard from './InsightsDashboard';
import { SubredditSearchModal } from './SubredditSearchModal';
import SubredditDiscovery from './SubredditDiscovery';
import KeywordSearch from './KeywordSearch';
import { Spinner } from './ui/spinner';
import { useRedditContext } from '../context/RedditContext';
import { ClusterManager } from './ClusterManager';
import { Layout } from './Layout';
import EngagementAnalysis from './EngagementAnalysis';
import SentimentAnalysis from './SentimentAnalysis';
import FAQ from './FAQ';

export default function SubredditExplorer() {
  const {
    clusters,
    activeCluster,
    subreddits,
    posts,
    isLoading,
    error,
    timeframe,
    sort,
    addSubreddit,
    removeSubreddit,
    setTimeframe,
    setSort,
    refreshPosts
  } = useRedditContext();

  const [inputSubreddit, setInputSubreddit] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts, refreshKey, activeCluster]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSubreddit.trim()) {
      addSubreddit(inputSubreddit.trim());
      setInputSubreddit('');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-accent">Latest Posts</h2>
              <PostList posts={posts} />
            </section>
            <section className="space-y-6 mt-8">
              <h2 className="text-2xl font-semibold text-accent">Analytics Overview</h2>
              <AnalyticsOverview posts={posts} />
            </section>
          </>
        );
      case 'trends':
        return <TrendAnalysis posts={posts} />;
      case 'engagement':
        return <EngagementAnalysis posts={posts} />;
      case 'keyTerms':
        return <InsightsDashboard />;
      case 'sentimentAnalysis':
        return <SentimentAnalysis posts={posts} />;
      case 'subredditDiscovery':
        return <SubredditDiscovery onAddSubreddit={addSubreddit} />;
      case 'keywordSearch':
        return <KeywordSearch />;
      case 'clusters':
        return <ClusterManager />;
      case 'faq':
        return <FAQ />;
      default:
        return <div className="card">Select a tab from the sidebar to view content</div>;
    }
  };

  const currentSubreddits = activeCluster
    ? clusters.find(c => c.id === activeCluster)?.subreddits || []
    : subreddits;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-8">
        {error && (
          <div className="bg-destructive text-destructive-foreground p-4 rounded-md">
            <p className="font-bold">Error: {error.message}</p>
            {error.details && <p className="mt-2">{error.details}</p>}
          </div>
        )}

        <section className="card space-y-6">
          <h2 className="text-2xl font-semibold text-accent">
            {activeCluster 
              ? `Active Cluster: ${clusters.find(c => c.id === activeCluster)?.name}`
              : "Subreddit Management"}
          </h2>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={inputSubreddit}
              onChange={(e) => setInputSubreddit(e.target.value)}
              placeholder="Enter a subreddit"
              className="flex-grow input"
            />
            <Button type="submit" className="btn-primary">Add</Button>
            <SubredditSearchModal onAddSubreddit={addSubreddit} />
          </form>
          <div className="flex flex-wrap gap-2">
            {currentSubreddits.map(subreddit => (
              <div key={subreddit} className="bg-secondary px-3 py-1 rounded-full flex items-center">
                <span className="text-secondary-foreground">r/{subreddit}</span>
                <button onClick={() => removeSubreddit(subreddit)} className="ml-2 text-destructive hover:text-destructive/90">&times;</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] input">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Past Hour</SelectItem>
                <SelectItem value="day">Past Day</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px] input">
                <SelectValue placeholder="Select sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} className="btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </section>

        {currentSubreddits.length === 0 && !isLoading && (
          <div className="bg-muted p-4 rounded-md flex items-center space-x-2">
            <AlertCircle className="text-muted-foreground" />
            <p className="text-muted-foreground">No subreddits added. Add some subreddits to see insights.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="w-8 h-8 text-accent" />
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </Layout>
  );
}

