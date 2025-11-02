import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type ForumPost, type ForumComment } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Copy, Plus, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Forum() {
  const { toast } = useToast();
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newPost, setNewPost] = useState({
    authorName: "",
    title: "",
    contentType: "game_code",
    gameType: "virtual",
    content: "",
  });

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/posts", selectedGameType],
    queryFn: async () => {
      const url = selectedGameType === "all" 
        ? "/api/forum/posts" 
        : `/api/forum/posts?gameType=${selectedGameType}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const { data: comments } = useQuery<ForumComment[]>({
    queryKey: ["/api/forum/posts", selectedPost?.id, "comments"],
    queryFn: selectedPost 
      ? () => fetch(`/api/forum/posts/${selectedPost.id}/comments`).then(r => r.json())
      : undefined,
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: typeof newPost) => {
      return await apiRequest("POST", "/api/forum/posts", post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setShowCreateDialog(false);
      setNewPost({
        authorName: "",
        title: "",
        contentType: "game_code",
        gameType: "virtual",
        content: "",
      });
      toast({
        title: "Success",
        description: "Your post has been created!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (comment: { postId: string; authorName: string; comment: string }) => {
      return await apiRequest("POST", "/api/forum/comments", comment);
    },
    onSuccess: () => {
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", selectedPost.id, "comments"] });
      }
      setCommentText("");
      setAuthorName("");
      toast({
        title: "Success",
        description: "Your comment has been added!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleCreatePost = () => {
    if (!newPost.authorName || !newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleAddComment = () => {
    if (!selectedPost || !authorName || !commentText) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate({
      postId: selectedPost.id,
      authorName,
      comment: commentText,
    });
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "game_code": return "Game Code";
      case "suggestion": return "Suggestion";
      case "numbers": return "Numbers";
      default: return type;
    }
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case "virtual": return "Virtual";
      case "aviator": return "Aviator";
      case "lucky_numbers": return "Lucky Numbers";
      case "super_virtual": return "Super Virtual";
      case "main": return "Main/Daily";
      case "midweek": return "Mid-Week";
      case "weekend": return "Weekend";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Community Forum</h1>
            <p className="text-gray-600 dark:text-gray-400">Share codes, numbers, and tips with the community</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post" className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Create New Post</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Share your game codes, lucky numbers, or suggestions with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="author" className="text-gray-900 dark:text-white">Your Name</Label>
                  <Input
                    id="author"
                    data-testid="input-author-name"
                    value={newPost.authorName}
                    onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="title" className="text-gray-900 dark:text-white">Title</Label>
                  <Input
                    id="title"
                    data-testid="input-post-title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title"
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="contentType" className="text-gray-900 dark:text-white">Content Type</Label>
                  <Select value={newPost.contentType} onValueChange={(val) => setNewPost({ ...newPost, contentType: val })}>
                    <SelectTrigger id="contentType" data-testid="select-content-type" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="game_code">Game Code</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="numbers">Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gameType" className="text-gray-900 dark:text-white">Game Type</Label>
                  <Select value={newPost.gameType} onValueChange={(val) => setNewPost({ ...newPost, gameType: val })}>
                    <SelectTrigger id="gameType" data-testid="select-game-type" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="aviator">Aviator</SelectItem>
                      <SelectItem value="lucky_numbers">Lucky Numbers</SelectItem>
                      <SelectItem value="super_virtual">Super Virtual</SelectItem>
                      <SelectItem value="main">Main/Daily</SelectItem>
                      <SelectItem value="midweek">Mid-Week</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content" className="text-gray-900 dark:text-white">Content</Label>
                  <Textarea
                    id="content"
                    data-testid="input-post-content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Enter your content (code, numbers, or suggestion)"
                    rows={4}
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  data-testid="button-submit-post"
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" value={selectedGameType} onValueChange={setSelectedGameType}>
          <TabsList className="bg-white dark:bg-gray-800 mb-6 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="all" 
              data-testid="tab-all"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="virtual" 
              data-testid="tab-virtual"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
            >
              Virtual
            </TabsTrigger>
            <TabsTrigger 
              value="aviator" 
              data-testid="tab-aviator"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
            >
              Aviator
            </TabsTrigger>
            <TabsTrigger 
              value="lucky_numbers" 
              data-testid="tab-lucky"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
            >
              Lucky Numbers
            </TabsTrigger>
            <TabsTrigger 
              value="main" 
              data-testid="tab-main"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
            >
              Main/Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedGameType}>
            {isLoading ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading posts...</div>
            ) : posts && posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" data-testid={`post-${post.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {getContentTypeLabel(post.contentType)}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {getGameTypeLabel(post.gameType)}
                            </Badge>
                          </div>
                          <CardTitle className="text-gray-900 dark:text-white">{post.title}</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.authorName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                        <p className="font-mono text-lg text-gray-900 dark:text-white break-all">{post.content}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        data-testid={`button-copy-${post.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyContent(post.content)}
                        className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Re-use
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            data-testid={`button-comments-${post.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                            className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comments
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">{post.title}</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              Comments and discussion
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                              <p className="font-mono text-gray-900 dark:text-white">{post.content}</p>
                            </div>
                            <Separator className="bg-gray-200 dark:bg-gray-700" />
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Comments</h4>
                              {comments && comments.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                  {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg" data-testid={`comment-${comment.id}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.authorName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No comments yet. Be the first!</p>
                              )}
                              <div className="space-y-3">
                                <Input
                                  data-testid="input-comment-author"
                                  placeholder="Your name"
                                  value={authorName}
                                  onChange={(e) => setAuthorName(e.target.value)}
                                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                                <Textarea
                                  data-testid="input-comment-text"
                                  placeholder="Add a comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  rows={3}
                                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                                <Button
                                  data-testid="button-submit-comment"
                                  onClick={handleAddComment}
                                  disabled={createCommentMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                >
                                  {createCommentMutation.isPending ? "Adding..." : "Add Comment"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="py-12 text-center text-gray-600 dark:text-gray-400">
                  <p>No posts yet. Be the first to share!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
