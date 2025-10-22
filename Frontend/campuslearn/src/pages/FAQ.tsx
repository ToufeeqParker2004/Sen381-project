import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const FAQ = () => {
  const [faqCategories, setFaqCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Get JWT token
      
      const response = await fetch('http://localhost:9090/api/faqs/grouped', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setFaqCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('FAQ fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading FAQs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          <p>Error loading FAQs: {error}</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about using the CampusLearn platform.</p>
      </div>

      <div className="grid gap-6">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="shadow-custom-md">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </div>
              <CardDescription>
                {category.faqs.length} questions in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold">Still need help?</h3>
            <p className="text-muted-foreground">
              If you can't find the answer you're looking for, don't hesitate to reach out to our support team.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">📧 support@campus.edu</Badge>
              <Badge variant="secondary">📞 +27 (0) 11 123-4567</Badge>
              <Badge variant="secondary">💬 Live Chat Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;